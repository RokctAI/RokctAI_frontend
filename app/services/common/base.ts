import { getClient } from "@/app/lib/client";
import { gatewayCall } from "@/app/lib/gateway-rpc";

export interface ServiceOptions {
  headers?: Record<string, string>;
}

export class BaseService {
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

  /** Alias for getDoc — kept because several services call BaseService.get. */
  public static async get(
    doctype: string,
    name: string,
    options: ServiceOptions = {},
  ) {
    return this.getDoc(doctype, name, options);
  }

  public static async insert(doc: any, options: ServiceOptions = {}) {
    const response = await this.call("frappe.client.insert", { doc }, options);
    return response?.message;
  }

  public static async setValue(
    doctype: string,
    name: string,
    fieldname: any,
    options: ServiceOptions = {},
  ) {
    return this.call(
      "frappe.client.set_value",
      { doctype, name, fieldname },
      options,
    );
  }

  public static async delete(
    doctype: string,
    name: string,
    options: ServiceOptions = {},
  ) {
    return this.call("frappe.client.delete", { doctype, name }, options);
  }

  public static async submit(doc: any, options: ServiceOptions = {}) {
    return this.call("frappe.client.submit", { doc }, options);
  }

  public static async cancel(
    doctype: string,
    name: string,
    options: ServiceOptions = {},
  ) {
    return this.call("frappe.client.cancel", { doctype, name }, options);
  }
}
