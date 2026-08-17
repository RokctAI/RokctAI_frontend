/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
