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
    const gateway = isControl
      ? "rcore.platform.api.control"
      : "rcore.platform.api.tenant";
    return await BaseService.call(
      gateway,
      {
        cmd: "control:system:reboot",
        payload,
      },
      options,
    );
  }
}
