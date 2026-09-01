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

export class EmailsService {
  static async getClientEmails(clientName?: string) {
    return ControlBaseService.call(
      "rpanel.hosting.doctype.hosting_client.hosting_client.get_client_emails",
      {
        client_name: clientName,
      },
    );
  }

  static async createEmailAccount(
    website: string,
    emailUser: string,
    password: string,
  ) {
    return ControlBaseService.call(
      "rpanel.hosting.doctype.hosted_website.hosted_website.add_email_account",
      {
        website,
        email_user: emailUser,
        password,
      },
    );
  }

  static async updateEmailPassword(
    website: string,
    emailUser: string,
    newPassword: string,
  ) {
    return ControlBaseService.call(
      "rpanel.hosting.doctype.hosted_website.hosted_website.change_email_password",
      {
        website,
        email_user: emailUser,
        new_password: newPassword,
      },
    );
  }

  static async deleteEmailAccount(website: string, emailUser: string) {
    return ControlBaseService.call(
      "rpanel.hosting.doctype.hosted_website.hosted_website.delete_email_account",
      {
        website,
        email_user: emailUser,
      },
    );
  }
}
