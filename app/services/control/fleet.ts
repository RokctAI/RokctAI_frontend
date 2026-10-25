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
 * Read-only. Both calls go through the one platform gateway to the hub's
 * staff cmds (System Manager only):
 *   control:fleet_board  -> {servers, dockers}
 *   control:fleet_docker -> {docker, usage_samples, settings_revisions, sites}
 */

export interface FleetBoardResponse {
  servers: {
    name: string;
    dockers_count: number;
    sites_count: number;
    red: number;
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
  }[];
}

export interface FleetDockerResponse {
  docker: FleetBoardResponse["dockers"][number];
  usage_samples: any[];
  settings_revisions: any[];
  sites: {
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
}
