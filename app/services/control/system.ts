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

import { ControlBaseService } from "./base";

export class SystemService {
  static async getBrainSettings() {
    return ControlBaseService.getList("Brain Settings", {
      fields: ["name", "default_model", "max_tokens", "temperature"],
      limit: 1,
    });
  }

  static async updateBrainSettings(name: string, data: any) {
    return ControlBaseService.update("Brain Settings", name, data);
  }

  static async getWeatherSettings() {
    return ControlBaseService.getList("Weather Settings", {
      fields: ["name", "api_key", "default_city"],
      limit: 1,
    });
  }

  static async updateWeatherSettings(name: string, data: any) {
    return ControlBaseService.update("Weather Settings", name, data);
  }

  static async getUpdateAuthorizations() {
    return ControlBaseService.getList("Update Authorization", {
      fields: [
        "name",
        "app_name",
        "status",
        "requested_by",
        "creation",
        "new_branch_name",
      ],
      order_by: "creation desc",
    });
  }

  static async approveUpdate(name: string) {
    return ControlBaseService.update("Update Authorization", name, {
      status: "Authorized",
    });
  }

  static async rejectUpdate(name: string) {
    return ControlBaseService.update("Update Authorization", name, {
      status: "Rejected",
    });
  }

  static async deleteUpdateAuthorization(name: string) {
    return ControlBaseService.delete("Update Authorization", name);
  }
}
