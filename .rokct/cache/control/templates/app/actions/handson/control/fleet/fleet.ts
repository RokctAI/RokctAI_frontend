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
import {
  demoBoard,
  demoDockerDetail,
  demoServerAgents,
} from "@/app/lib/fleet/demo";
import type {
  CompanyLinkRow,
  DockerDetail,
  DockerRow,
  FleetBoard,
  FleetResult,
  MoveJobRow,
  PlacementRow,
  ServerAgentRow,
  ServerSummary,
} from "@/app/lib/fleet/types";

/**
 * Fleet board reads. Staff only, read-only; the staff write actions are in
 * fleet-actions.ts.
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
    drift: !!d.drift,
    drift_sites: Array.isArray(d.drift_sites) ? d.drift_sites : [],
    last_probe_ok: !!d.last_probe_ok,
  };
}

/** Server totals; drift is counted from the dockers on a hub that predates it. */
function toServers(servers: any[], dockers: DockerRow[]): ServerSummary[] {
  return (servers || []).map((s) => ({
    name: s.name,
    dockers_count: s.dockers_count ?? 0,
    sites_count: s.sites_count ?? 0,
    red: s.red ?? 0,
    drift:
      s.drift ??
      dockers.filter((d) => (d.server || "") === (s.name || "") && d.drift)
        .length,
  }));
}

const toLink = (l: any): CompanyLinkRow => ({
  ...l,
  revision: l.revision ?? 0,
  from_acked_revision: l.from_acked_revision ?? 0,
  to_acked_revision: l.to_acked_revision ?? 0,
});

const toMove = (m: any): MoveJobRow => ({ ...m, postponed: !!m.postponed });

async function optionalList<T>(
  what: string,
  read: () => Promise<any[]>,
  shape: (r: any) => T,
): Promise<T[] | null> {
  try {
    return (await read()).map(shape);
  } catch (error) {
    console.error(`[fleet] ${what} read failed`, error);
    return null;
  }
}

export async function getFleet(): Promise<FleetResult<FleetBoard>> {
  await assertStaff();
  if (DEMO) return { data: demoBoard(), demo: true, source: "env-demo" };
  try {
    const board = await FleetService.board();
    const dockers = board.dockers.map(toDockerRow);
    return {
      data: { dockers, servers: toServers(board.servers, dockers) },
      demo: false,
      source: "live",
    };
  } catch (error) {
    console.error("[fleet] control:fleet_board failed", error);
    return {
      data: demoBoard(),
      demo: true,
      source: "fallback",
      notice: cmdFailed("control:fleet_board", error),
    };
  }
}

export async function getDockerDetail(
  name: string,
): Promise<FleetResult<DockerDetail | null>> {
  await assertStaff();
  if (DEMO)
    return { data: demoDockerDetail(name), demo: true, source: "env-demo" };
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
      name: p.subscription || p.site_name || `${p.company}-${i}`,
      subscription: p.subscription,
      company: p.company,
      site_name: p.site_name,
      plan: p.plan,
      status: p.status,
      lifecycle_state: p.lifecycle_state ?? null,
      state_entered_at: p.state_entered_at ?? null,
      next_transition_at: p.next_transition_at ?? null,
    }));
    const [links, moves] = await Promise.all([
      optionalList("Company Link", () => FleetService.links(name), toLink),
      optionalList("Move Job", () => FleetService.moves(name), toMove),
    ]);
    return {
      data: {
        docker: toDockerRow(res.docker),
        usage,
        revisions,
        placements,
        links,
        moves,
      },
      demo: false,
      source: "live",
    };
  } catch (error) {
    console.error("[fleet] control:fleet_docker failed", error);
    const notice = cmdFailed("control:fleet_docker", error);
    const fallback = demoDockerDetail(name);
    return fallback
      ? { data: fallback, demo: true, source: "fallback", notice }
      : { data: null, demo: false, source: "fallback", notice };
  }
}

/**
 * Server agents for the board. `data` is null when the hub could not be read
 * for them; the card says so rather than showing fixtures beside live dockers.
 */
export async function getServerAgents(): Promise<
  FleetResult<ServerAgentRow[] | null>
> {
  await assertStaff();
  if (DEMO) return { data: demoServerAgents(), demo: true, source: "env-demo" };
  const data = await optionalList(
    "Server Agent",
    () => FleetService.serverAgents(),
    (r: any): ServerAgentRow => ({ ...r, server: r.server || r.name }),
  );
  return { data, demo: false, source: "live" };
}
