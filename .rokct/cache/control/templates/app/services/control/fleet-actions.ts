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
 *
 * Payload keys are the hub's argument names (control api/fleet/*.py):
 *   docker_stop, docker_start, hub_rotate_key   docker_id
 *   docker_restore                              subscription or docker_id, reason?
 *   lifecycle_extend                            subscription, days, reason
 *   lifecycle_remove                            subscription, reason
 *   hub_request_export                          subscription
 *   move_plan                                   subscription, to_docker?, quiet_hour_window?, dedicated?
 *   move_abort                                  move_job, reason?
 *   move_postpone                               move_job
 *   move_rollback                               move_job, reason, skip_export?
 *   hub_issue_enrolment_token                   docker_type, server or docker_id, expires_hours?
 *   server_issue_enrolment_token                server, expires_hours?
 *   server_rotate_key                           server
 *   rollout_start                               rollout, reset_failed
 *   rollout_pause, rollout_rollback             rollout, reason?
 */
export const FLEET_ACTION_CMDS = {
  docker_stop: "control:docker_stop",
  docker_start: "control:docker_start",
  docker_restore: "control:docker_restore",
  lifecycle_extend: "control:lifecycle_extend",
  lifecycle_remove: "control:lifecycle_remove",
  hub_request_export: "control:hub_request_export",
  move_plan: "control:move_plan",
  move_abort: "control:move_abort",
  move_postpone: "control:move_postpone",
  move_rollback: "control:move_rollback",
  hub_issue_enrolment_token: "control:hub_issue_enrolment_token",
  server_issue_enrolment_token: "control:server_issue_enrolment_token",
  hub_rotate_key: "control:hub_rotate_key",
  server_rotate_key: "control:server_rotate_key",
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
