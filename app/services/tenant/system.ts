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

import { TenantBaseService } from "./base";

export class SystemService {
  static async getApiErrorLogs() {
    return TenantBaseService.getList("API Error Log", {
      fields: ["name", "title", "creation", "seen"],
      order_by: "creation desc",
      limit: 50,
    });
  }

  static async getApiErrorLog(name: string) {
    return TenantBaseService.getDoc("API Error Log", name);
  }

  static async deleteApiErrorLog(name: string) {
    return TenantBaseService.delete("API Error Log", name);
  }

  static async getTokenUsageLogs() {
    return TenantBaseService.getList("Token Usage Tracker", {
      fields: ["name", "user", "model", "total_tokens", "creation"],
      order_by: "creation desc",
      limit: 50,
    });
  }
}
