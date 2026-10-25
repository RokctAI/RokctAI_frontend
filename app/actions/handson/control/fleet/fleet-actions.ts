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
}

const DEMO = process.env.ROKCT_DEMO_DATA === "1";

const LABEL: Record<FleetActionKind, string> = {
  docker_stop: "Docker stop requested",
  docker_start: "Docker start requested",
  lifecycle_extend: "Lifecycle extended",
  hub_request_export: "Export requested",
  rollout_start: "Rollout started",
  rollout_pause: "Rollout paused",
  rollout_rollback: "Rollback started",
};

function validate(
  kind: FleetActionKind,
  p: Record<string, unknown>,
): string | null {
  const str = (k: string) => typeof p[k] === "string" && String(p[k]).trim();
  switch (kind) {
    case "docker_stop":
    case "docker_start":
      return str("docker") ? null : "A docker is required.";
    case "hub_request_export":
      return str("subscription") ? null : "A subscription is required.";
    case "lifecycle_extend": {
      if (!str("subscription")) return "A subscription is required.";
      const d = Number(p.days);
      if (!Number.isInteger(d) || d < 1 || d > 90)
        return "Days must be a whole number from 1 to 90.";
      return str("reason") ? null : "A reason is required.";
    }
    case "rollout_start":
    case "rollout_rollback":
      return str("rollout") ? null : "A rollout is required.";
    case "rollout_pause":
      if (!str("rollout")) return "A rollout is required.";
      return str("reason") ? null : "A reason is required.";
  }
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
    };
  }

  try {
    await FleetActionsService.run(kind, payload);
    return { ok: true, message: `${LABEL[kind]}.` };
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
