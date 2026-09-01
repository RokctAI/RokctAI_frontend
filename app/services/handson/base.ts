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

import { getClient } from "@/app/lib/client";
import { gatewayCall } from "@/app/lib/gateway-rpc";

export interface ServiceOptions {
  headers?: Record<string, string>;
}

export class HandsonBaseService {
  /**
   * Executes a whitelisted dotted method against the PaaS site through
   * the universal platform gateway (a `{cmd, payload}` POST — see
   * app/lib/gateway-rpc.ts). Returns the full response body (Frappe `message` envelope
   * preserved) so `response?.message` consumers keep working.
   */
  public static async call(
    method: string,
    args: any = {},
    options: ServiceOptions = {},
  ) {
    const client = await getClient();
    return gatewayCall(client, method, args, options.headers);
  }

  public static async getList(
    doctype: string,
    args: any = {},
    options: ServiceOptions = {},
  ) {
    const response = await this.call(
      "frappe.client.get_list",
      { doctype, ...args },
      options,
    );
    return response?.message ?? [];
  }

  public static async getDoc(
    doctype: string,
    name: string,
    options: ServiceOptions = {},
  ) {
    const response = await this.call(
      "frappe.client.get",
      { doctype, name },
      options,
    );
    return response?.message;
  }

  public static async insert(doc: any, options: ServiceOptions = {}) {
    const response = await this.call("frappe.client.insert", { doc }, options);
    return response?.message;
  }

  public static async update(
    doctype: string,
    name: string,
    data: any,
    options: ServiceOptions = {},
  ) {
    const response = await this.call(
      "frappe.client.set_value",
      { doctype, name, fieldname: data },
      options,
    );
    return response?.message;
  }

  public static async delete(
    doctype: string,
    name: string,
    options: ServiceOptions = {},
  ) {
    return this.call("frappe.client.delete", { doctype, name }, options);
  }
}
