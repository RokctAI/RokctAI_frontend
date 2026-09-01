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

export interface NotificationTemplate {
  name: string;
  subject: string;
  response: string;
  type?: string;
}

export class NotificationService {
  static async getMasterTemplates() {
    return ControlBaseService.getList("Email Template", {
      fields: ["name", "subject", "response", "type"],
      limit_page_length: 100,
    });
  }

  static async saveMasterTemplate(
    name: string,
    subject: string,
    content: string,
  ) {
    return ControlBaseService.update("Email Template", name, {
      subject: subject,
      response: content,
    });
  }

  static async createMasterTemplate(
    name: string,
    subject: string,
    content: string,
  ) {
    return ControlBaseService.insert({
      doctype: "Email Template",
      name: name,
      subject: subject,
      response: content,
      type: "User",
    });
  }
}
