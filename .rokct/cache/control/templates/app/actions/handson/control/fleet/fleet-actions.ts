/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

"use server";

import { auth } from "@/app/(auth)/auth";
import { SYSTEM_ROLES } from "@/app/lib/role_constants";
import { isFixtureId } from "@/app/lib/fleet/demo";
import {
  FleetActionsService,
  type FleetActionKind,
} from "@/app/services/control/fleet-actions";

export interface FleetActionResult {
  ok: boolean;
  demo?: boolean;
  /** The cmd is not registered on the hub yet (its control PR is unmerged). */
  unavailable?: boolean;
  message: string;
  /** What the hub returned (an enrolment token is shown once, from here). */
  data?: Record<string, unknown>;
}

const DEMO = process.env.ROKCT_DEMO_DATA === "1";

const LABEL: Record<FleetActionKind, string> = {
  docker_stop: "Docker stop requested",
  docker_start: "Docker start requested",
  docker_restore: "Restore requested",
  lifecycle_extend: "Lifecycle extended",
  lifecycle_remove: "Tenant removed",
  hub_request_export: "Export requested",
  move_plan: "Move planned",
  move_abort: "Move aborted",
  move_postpone: "Move postponed",
  move_rollback: "Move rollback started",
  hub_issue_enrolment_token: "Docker enrolment token issued",
  server_issue_enrolment_token: "Server agent enrolment token issued",
  hub_rotate_key: "Docker key rotation queued",
  server_rotate_key: "Server agent key rotation queued",
  rollout_start: "Rollout started",
  rollout_pause: "Rollout paused",
  rollout_rollback: "Rollback started",
};

const DOCKER_TYPES = [
  "hub",
  "tenant",
  "deliveryplatform",
  "polaris",
  "supacharge",
];

/** Payload keys that name a registry record (checked against fixture ids). */
const ID_KEYS = ["docker", "docker_id", "subscription", "server", "move_job"];

function validate(
  kind: FleetActionKind,
  p: Record<string, unknown>,
): string | null {
  const str = (k: string) => typeof p[k] === "string" && String(p[k]).trim();
  switch (kind) {
    case "docker_stop":
    case "docker_start":
    case "hub_rotate_key":
      return str("docker_id") ? null : "A docker is required.";
    case "docker_restore":
      return str("subscription") || str("docker_id")
        ? null
        : "A subscription or a docker is required.";
    case "hub_request_export":
      return str("subscription") ? null : "A subscription is required.";
    case "lifecycle_extend": {
      if (!str("subscription")) return "A subscription is required.";
      const d = Number(p.days);
      if (!Number.isInteger(d) || d < 1 || d > 90)
        return "Days must be a whole number from 1 to 90.";
      return str("reason") ? null : "A reason is required.";
    }
    case "lifecycle_remove":
      if (!str("subscription")) return "A subscription is required.";
      return str("reason") ? null : "A reason is required.";
    case "move_plan":
      return str("subscription") ? null : "A subscription is required.";
    case "move_abort":
    case "move_postpone":
      return str("move_job") ? null : "A move job is required.";
    case "move_rollback":
      if (!str("move_job")) return "A move job is required.";
      return str("reason") ? null : "A reason is required.";
    case "hub_issue_enrolment_token":
      if (!DOCKER_TYPES.includes(String(p.docker_type)))
        return "Pick the docker type.";
      return str("server") || str("docker_id")
        ? null
        : "Give the server or an existing docker.";
    case "server_issue_enrolment_token":
    case "server_rotate_key":
      return str("server") ? null : "A server is required.";
    case "rollout_start":
    case "rollout_rollback":
      return str("rollout") ? null : "A rollout is required.";
    case "rollout_pause":
      if (!str("rollout")) return "A rollout is required.";
      return str("reason") ? null : "A reason is required.";
  }
}

/** Demo result for the token cmds: a clearly fake token, never a real one. */
function demoData(
  kind: FleetActionKind,
  p: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (
    kind !== "hub_issue_enrolment_token" &&
    kind !== "server_issue_enrolment_token"
  )
    return undefined;
  return {
    enrolment_token: "demo-not-a-real-token",
    docker_id: p.docker_id ?? null,
    server: p.server ?? null,
    expires_at: new Date(Date.now() + 24 * 3_600_000).toISOString(),
  };
}

function isMissingCmd(msg: string) {
  return /cmd not found|unknown cmd|not registered|no handler/i.test(msg);
}

async function isSystemManager(): Promise<boolean> {
  const session = await auth();
  const roles: string[] = (session?.user as any)?.roles || [];
  return roles.some((r) => SYSTEM_ROLES.includes(r));
}

/** Whether the current user may see and run fleet staff actions. */
export async function canRunFleetActions(): Promise<boolean> {
  return isSystemManager();
}

export async function runFleetAction(
  kind: FleetActionKind,
  payload: Record<string, unknown>,
): Promise<FleetActionResult> {
  if (!(await isSystemManager())) {
    return {
      ok: false,
      message: "Fleet actions are for System Managers only.",
    };
  }
  if (!(kind in LABEL)) return { ok: false, message: "Unknown action." };
  const invalid = validate(kind, payload);
  if (invalid) return { ok: false, message: invalid };

  if (DEMO) {
    return {
      ok: true,
      demo: true,
      message: `Demo: ${LABEL[kind].toLowerCase()} (nothing was sent).`,
      data: demoData(kind, payload),
    };
  }

  if (ID_KEYS.some((k) => isFixtureId(payload[k]))) {
    return {
      ok: false,
      message:
        "This page is showing fallback demo data, so actions are disabled. Reload once the hub is reachable.",
    };
  }

  try {
    const res = await FleetActionsService.run(kind, payload);
    return {
      ok: true,
      message: `${LABEL[kind]}.`,
      data: res && typeof res === "object" ? res : undefined,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[fleet] ${kind} failed`, msg);
    if (isMissingCmd(msg)) {
      return {
        ok: false,
        unavailable: true,
        message:
          "This hub does not support that action yet. It ships with a pending control update; nothing was changed.",
      };
    }
    return { ok: false, message: msg.slice(0, 240) || "The action failed." };
  }
}
