import { getControlClient } from "@/app/lib/client";
import { frappeRpc } from "@/app/lib/frappe-rpc";

export interface ServiceOptions {
  headers?: Record<string, string>;
}

export class TenantBaseService {
  /**
   * Executes a whitelisted dotted method against the Control Plane as a
   * real HTTP POST. Returns the full response body (Frappe `message`
   * envelope preserved) so `response?.message` consumers keep working.
   */
  public static async call(
    method: string,
    args: any = {},
    options: ServiceOptions = {},
  ) {
    const client = await getControlClient();
    return frappeRpc(client, method, args, options.headers);
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
