// @ts-nocheck
/**
 * Generated Service for Platform Module: control, Group: system
 * Author: ROKCT Code Generator
 */
import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class SystemService {
  /**
   * Trigger control plane graceful system reboot
   */
  static async reboot(payload?: any, options?: ServiceOptions) {
    const isControl = "control:system:reboot".startsWith("control:");
    const gateway = isControl ? "rcore.platform.api.control" : "rcore.platform.api.tenant";
    return await BaseService.call(
      gateway,
      {
        cmd: "control:system:reboot",
        payload
      },
      options
    );
  }
}
