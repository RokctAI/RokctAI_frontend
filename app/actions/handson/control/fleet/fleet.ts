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
  PlacementRow,
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

function cmdFailed(cmd: string, error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  return `${cmd} failed (${msg.slice(0, 140)}). Showing demo data.`;
}

/** Map a board/detail docker row onto the shape the pages render. */
function toDockerRow(d: any): DockerRow {
  return {
    ...d,
    docker_id: d.docker_id || d.name,
    heartbeat_status: d.heartbeat_status || d.health,
    site_count: d.site_count ?? d.sites_count,
  };
}

export async function getFleet(): Promise<FleetResult<DockerRow[]>> {
  await assertStaff();
  if (DEMO) return { data: demoDockers(), demo: true };
  try {
    const board = await FleetService.board();
    return { data: board.dockers.map(toDockerRow), demo: false };
  } catch (error) {
    console.error("[fleet] control:fleet_board failed", error);
    return {
      data: demoDockers(),
      demo: true,
      notice: cmdFailed("control:fleet_board", error),
    };
  }
}

export async function getDockerDetail(
  name: string,
): Promise<FleetResult<DockerDetail | null>> {
  await assertStaff();
  if (DEMO) return { data: demoDockerDetail(name), demo: true };
  try {
    const res = await FleetService.docker(name);
    const usage = [...(res.usage_samples || [])].sort((a: any, b: any) =>
      String(b.date).localeCompare(String(a.date)),
    );
    const revisions = (res.settings_revisions || []).map((r: any) => ({
      ...r,
      created_at: r.created_at || r.creation,
    }));
    const placements: PlacementRow[] = (res.sites || []).map((p, i) => ({
      name: p.site_name || `${p.company}-${i}`,
      company: p.company,
      site_name: p.site_name,
      plan: p.plan,
      status: p.status,
      lifecycle_state: p.lifecycle_state ?? null,
      state_entered_at: p.state_entered_at ?? null,
      next_transition_at: p.next_transition_at ?? null,
    }));
    return {
      data: { docker: toDockerRow(res.docker), usage, revisions, placements },
      demo: false,
    };
  } catch (error) {
    console.error("[fleet] control:fleet_docker failed", error);
    const notice = cmdFailed("control:fleet_docker", error);
    const fallback = demoDockerDetail(name);
    return fallback
      ? { data: fallback, demo: true, notice }
      : { data: null, demo: false, notice };
  }
}
