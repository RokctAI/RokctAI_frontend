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

export class SystemService {
  static async getBrainSettings() {
    return ControlBaseService.getList("Brain Settings", {
      fields: ["name", "default_model", "max_tokens", "temperature"],
      limit: 1,
    });
  }

  static async updateBrainSettings(name: string, data: any) {
    return ControlBaseService.update("Brain Settings", name, data);
  }

  static async getWeatherSettings() {
    return ControlBaseService.getList("Weather Settings", {
      fields: ["name", "api_key", "default_city"],
      limit: 1,
    });
  }

  static async updateWeatherSettings(name: string, data: any) {
    return ControlBaseService.update("Weather Settings", name, data);
  }

  static async getUpdateAuthorizations() {
    return ControlBaseService.getList("Update Authorization", {
      fields: [
        "name",
        "app_name",
        "status",
        "requested_by",
        "creation",
        "new_branch_name",
      ],
      order_by: "creation desc",
    });
  }

  static async approveUpdate(name: string) {
    return ControlBaseService.update("Update Authorization", name, {
      status: "Authorized",
    });
  }

  static async rejectUpdate(name: string) {
    return ControlBaseService.update("Update Authorization", name, {
      status: "Rejected",
    });
  }

  static async deleteUpdateAuthorization(name: string) {
    return ControlBaseService.delete("Update Authorization", name);
  }
}
