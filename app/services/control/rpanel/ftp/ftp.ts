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

export class FtpService {
  static async getClientFtpAccounts(clientName?: string) {
    return ControlBaseService.call(
      "rpanel.hosting.doctype.hosting_client.hosting_client.get_client_ftp_accounts",
      {
        client_name: clientName,
      },
    );
  }

  static async createFtpAccount(
    website: string,
    username: string,
    password: string,
  ) {
    return ControlBaseService.call(
      "rpanel.hosting.utils.ftp_manager.create_ftp_account",
      {
        website,
        username,
        password,
      },
    );
  }

  static async updateFtpPassword(name: string, newPassword: string) {
    return ControlBaseService.update("FTP Account", name, {
      password: newPassword,
    });
  }

  static async deleteFtpAccount(name: string) {
    return ControlBaseService.delete("FTP Account", name);
  }
}
