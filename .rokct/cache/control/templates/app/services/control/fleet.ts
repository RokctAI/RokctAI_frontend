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

import { ControlBaseService } from "./base";

/**
 * Fleet registry reads for the control persona (federated hubs, spec 6.4).
 *
 * Read-only. Every call is a control: staff cmd (System Manager only) through
 * the one platform gateway (POST /api/v1/method/rokct.platform.api):
 *   control:fleet_board        -> {servers, dockers}
 *   control:fleet_docker       -> {docker, usage_samples, settings_revisions, sites}
 *   control:server_agent_list  -> {agents}
 *   control:company_link_list  -> {links}  (docker_id: either side)
 *   control:move_list          -> {moves}  (docker_id: from or to)
 * The list cmds return named fields only, never keys.
 */

export interface FleetBoardResponse {
  servers: {
    name: string;
    dockers_count: number;
    sites_count: number;
    red: number;
    drift?: number;
  }[];
  dockers: {
    name: string;
    docker_type: string;
    server: string;
    state: string;
    hosting_tier?: string;
    last_heartbeat_at?: string | null;
    health?: string;
    settings_revision_desired?: number;
    settings_revision_applied?: number;
    app_version?: string;
    sites_count?: number;
    drift?: boolean;
    drift_sites?: string[];
    red_alert_at?: string | null;
    last_probe_at?: string | null;
    last_probe_status?: string | null;
    last_probe_ok?: boolean;
  }[];
}

export interface FleetDockerResponse {
  docker: FleetBoardResponse["dockers"][number];
  usage_samples: any[];
  settings_revisions: any[];
  sites: {
    subscription?: string;
    company: string;
    plan?: string;
    site_name?: string;
    status?: string;
    lifecycle_state?: string | null;
    state_entered_at?: string | null;
    next_transition_at?: string | null;
  }[];
}

function unwrap<T>(response: any): T {
  return (response?.message ?? response) as T;
}

function listOf(rows: unknown, cmd: string, key: string): any[] {
  if (!Array.isArray(rows)) throw new Error(`${cmd} returned no ${key} list`);
  return rows;
}

export class FleetService {
  static async board(): Promise<FleetBoardResponse> {
    const res = unwrap<FleetBoardResponse>(
      await ControlBaseService.call("control:fleet_board", {}),
    );
    if (!res || !Array.isArray(res.dockers)) {
      throw new Error("control:fleet_board returned no dockers list");
    }
    return res;
  }

  static async docker(docker: string): Promise<FleetDockerResponse> {
    const res = unwrap<FleetDockerResponse>(
      await ControlBaseService.call("control:fleet_docker", { docker }),
    );
    if (!res || !res.docker) {
      throw new Error("control:fleet_docker returned no docker");
    }
    return res;
  }

  static async serverAgents(): Promise<any[]> {
    const res = unwrap<{ agents: any[] }>(
      await ControlBaseService.call("control:server_agent_list", {}),
    );
    return listOf(res?.agents, "control:server_agent_list", "agents");
  }

  /** Company links where the docker is either side. */
  static async links(docker: string): Promise<any[]> {
    const res = unwrap<{ links: any[] }>(
      await ControlBaseService.call("control:company_link_list", {
        docker_id: docker,
      }),
    );
    return listOf(res?.links, "control:company_link_list", "links");
  }

  /** Move jobs from or to the docker, newest first. */
  static async moves(docker: string): Promise<any[]> {
    const res = unwrap<{ moves: any[] }>(
      await ControlBaseService.call("control:move_list", { docker_id: docker }),
    );
    return listOf(res?.moves, "control:move_list", "moves");
  }
}
