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
 * Staff write actions for the fleet board. Each one is a control: cmd sent
 * through the platform gateway (POST /api/v1/method/rokct.platform.api). The
 * hub enforces System Manager on every cmd; the frontend checks too.
 */
export const FLEET_ACTION_CMDS = {
  docker_stop: "control:docker_stop",
  docker_start: "control:docker_start",
  lifecycle_extend: "control:lifecycle_extend",
  hub_request_export: "control:hub_request_export",
  rollout_start: "control:rollout_start",
  rollout_pause: "control:rollout_pause",
  rollout_rollback: "control:rollout_rollback",
} as const;

export type FleetActionKind = keyof typeof FLEET_ACTION_CMDS;

export class FleetActionsService extends ControlBaseService {
  static async run(kind: FleetActionKind, payload: Record<string, unknown>) {
    const res = await this.call(FLEET_ACTION_CMDS[kind], payload);
    return res?.message ?? res;
  }
}
