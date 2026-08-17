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
import { getControlClient } from "@/app/lib/client";

export class DeveloperService {
  static async getSwaggerSettings() {
    return ControlBaseService.getList("Swagger Settings", {
      fields: ["name", "installed_apps_cache"],
      limit: 1,
    });
  }

  static async generateSwaggerDocumentation() {
    return ControlBaseService.call(
      "control.control.doctype.swagger_settings.swagger_settings.enqueue_swagger_generation",
    );
  }

  static async getSwaggerAppRenames() {
    return ControlBaseService.getList("Swagger App Rename", {
      fields: ["name", "original_name", "new_name"],
      order_by: "creation desc",
    });
  }

  static async deleteSwaggerAppRename(name: string) {
    return ControlBaseService.delete("Swagger App Rename", name);
  }

  static async getExcludedDoctypes() {
    return ControlBaseService.getList("Excluded DocType", {
      fields: ["name", "doctype_name"],
      order_by: "creation desc",
    });
  }

  static async deleteExcludedDoctype(name: string) {
    return ControlBaseService.delete("Excluded DocType", name);
  }

  static async getExcludedSwaggerModules() {
    return ControlBaseService.getList("Excluded Swagger Module", {
      fields: ["name", "module_name"],
      order_by: "creation desc",
    });
  }

  static async deleteExcludedSwaggerModule(name: string) {
    return ControlBaseService.delete("Excluded Swagger Module", name);
  }

  static async getExcludedSwaggerDoctypes() {
    return ControlBaseService.getList("Excluded Swagger DocType", {
      fields: ["name", "doctype_name"],
      order_by: "creation desc",
    });
  }

  static async deleteExcludedSwaggerDoctype(name: string) {
    return ControlBaseService.delete("Excluded Swagger DocType", name);
  }

  static async getTenantErrorLogs() {
    return ControlBaseService.getList("Tenant Error Log", {
      fields: ["name", "error", "timestamp", "tenant"],
      order_by: "timestamp desc",
      limit: 50,
    });
  }

  static async getRawNeurotrophinCache() {
    return ControlBaseService.getList("Raw Neurotrophin Cache", {
      fields: ["name", "key", "expires_at"],
      limit: 50,
    });
  }

  static async getRawTenderCache() {
    return ControlBaseService.getList("Raw Tender Cache", {
      fields: ["name", "key", "expires_at"],
      limit: 50,
    });
  }
}
