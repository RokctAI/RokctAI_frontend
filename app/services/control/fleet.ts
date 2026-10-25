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
 * Fleet registry reads for the control persona (federated hubs, WP1b).
 *
 * Read-only. Every call goes through the one platform gateway with the
 * generic `frappe.client.*` cmds this shell already uses for doctypes,
 * because the hub has no dedicated fleet list cmd yet (`control:fleet_board`
 * is named in the spec, section 6.4, but not built). When it lands, swap
 * `listDockers` over to it and keep the return shape.
 */

export const DOCKER_FIELDS = [
  "name",
  "docker_id",
  "docker_type",
  "server",
  "ownership",
  "hosting_tier",
  "state",
  "state_since",
  "app_version",
  "lock_sha",
  "template",
  "settings_revision_desired",
  "settings_revision_applied",
  "last_heartbeat_at",
  "heartbeat_status",
  "site_count",
  "tenant_count",
];

export class FleetService {
  static async listDockers() {
    return ControlBaseService.getList("Docker Instance", {
      fields: DOCKER_FIELDS,
      order_by: "server asc, docker_type asc",
      limit_page_length: 0,
    });
  }

  /** Full doc, including the `usage_latest` Usage Sample child rows. */
  static async getDocker(name: string) {
    return ControlBaseService.getDoc("Docker Instance", name);
  }

  static async listSettingsRevisions(docker: string, limit = 10) {
    return ControlBaseService.getList("Settings Revision", {
      filters: { docker },
      fields: [
        "name",
        "revision",
        "created_at",
        "created_by",
        "applied_at",
        "apply_result",
        "diff",
      ],
      order_by: "revision desc",
      limit_page_length: limit,
    });
  }

  /** Sites placed on this docker, with their lifecycle state (spec 7.2). */
  static async listPlacements(docker: string) {
    return ControlBaseService.getList("Company Subscription", {
      filters: { docker },
      fields: [
        "name",
        "company",
        "plan",
        "status",
        "lifecycle_state",
        "lifecycle_since",
        "lifecycle_next_at",
      ],
      order_by: "company asc",
      limit_page_length: 0,
    });
  }
}
