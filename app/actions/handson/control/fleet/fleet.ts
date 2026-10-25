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
import { FleetService } from "@/app/services/control/fleet";
import { demoDockerDetail, demoDockers } from "@/app/lib/fleet/demo";
import type {
  DockerDetail,
  DockerRow,
  FleetResult,
} from "@/app/lib/fleet/types";

/**
 * Fleet board reads (WP1b). Staff only, read-only: no lifecycle or docker
 * state actions live here until WP4/WP5 (spec 6.4 `control:docker_set_state`,
 * `control:lifecycle_extend`).
 */

const DEMO = process.env.ROKCT_DEMO_DATA === "1";

async function assertStaff() {
  const session = await auth();
  const roles: string[] = (session?.user as any)?.roles || [];
  if (!roles.some((r) => SYSTEM_ROLES.includes(r))) {
    throw new Error("The fleet board is for platform staff only.");
  }
}

function missingRegistry(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  return `Live registry unavailable (${msg.slice(0, 140)}). Showing demo data until the hub's fleet module is installed.`;
}

export async function getFleet(): Promise<FleetResult<DockerRow[]>> {
  await assertStaff();
  if (DEMO) return { data: demoDockers(), demo: true };
  try {
    const rows = (await FleetService.listDockers()) as DockerRow[];
    return { data: rows || [], demo: false };
  } catch (error) {
    console.error("[fleet] listDockers failed", error);
    return { data: demoDockers(), demo: true, notice: missingRegistry(error) };
  }
}

export async function getDockerDetail(
  name: string,
): Promise<FleetResult<DockerDetail | null>> {
  await assertStaff();
  if (DEMO) return { data: demoDockerDetail(name), demo: true };
  try {
    const doc = await FleetService.getDocker(name);
    if (!doc) return { data: null, demo: false };
    const [revisions, placements] = await Promise.all([
      FleetService.listSettingsRevisions(name).catch(() => []),
      FleetService.listPlacements(name).catch(() => []),
    ]);
    const usage = [...(doc.usage_latest || [])].sort((a: any, b: any) =>
      String(b.date).localeCompare(String(a.date)),
    );
    return {
      data: { docker: doc, usage, revisions, placements },
      demo: false,
    };
  } catch (error) {
    console.error("[fleet] getDocker failed", error);
    const fallback = demoDockerDetail(name);
    return fallback
      ? { data: fallback, demo: true, notice: missingRegistry(error) }
      : { data: null, demo: false, notice: missingRegistry(error) };
  }
}
