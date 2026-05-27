// @ts-nocheck
/**
 * Generated Service for Platform Module: paas, Group: orders
 * Author: ROKCT Code Generator
 */
import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class OrdersService {
  /**
   * Fetch list of client orders
   */
  static async list(payload?: any, options?: ServiceOptions) {
    const isControl = "paas:orders:list".startsWith("control:");
    const gateway = isControl ? "rcore.platform.api.control" : "rcore.platform.api.tenant";
    return await BaseService.call(
      gateway,
      {
        cmd: "paas:orders:list",
        payload
      },
      options
    );
  }
}
