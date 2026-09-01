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

import { ControlBaseService } from "../../base";

export class WebsitesService {
  static async getClientWebsites(clientName?: string) {
    return ControlBaseService.call(
      "rpanel.hosting.doctype.hosting_client.hosting_client.get_client_websites",
      {
        client_name: clientName,
      },
    );
  }

  static async deleteWebsite(name: string) {
    return ControlBaseService.delete("Hosted Website", name);
  }

  static async updateWebsite(name: string, data: any) {
    return ControlBaseService.update("Hosted Website", name, data);
  }

  static async createWebsite(data: any) {
    return ControlBaseService.insert({ doctype: "Hosted Website", ...data });
  }
}
