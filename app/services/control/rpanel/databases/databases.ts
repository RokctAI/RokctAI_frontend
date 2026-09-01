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

export class DatabasesService {
  static async getClientDatabases(clientName?: string) {
    return ControlBaseService.call(
      "rpanel.hosting.doctype.hosting_client.hosting_client.get_client_databases",
      {
        client_name: clientName,
      },
    );
  }

  static async updateDatabasePassword(
    websiteName: string,
    newPassword: string,
  ) {
    return ControlBaseService.update("Hosted Website", websiteName, {
      db_password: newPassword,
    });
  }
}
