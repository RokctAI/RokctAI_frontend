/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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

export type ConfigCategory =
  "Task Status" | "Tag" | "Label" | "Account Name" | "Workflow State";
export type ConfigRegion = "All" | "RSA" | "KEN" | "USA" | "EUR";

export interface ConfigItem {
  name?: string;
  category: ConfigCategory;
  label: string;
  key: string;
  region: ConfigRegion;
  is_active: number;
  description?: string;
}

export class MasterConfigService {
  static async getMasterConfigItems(
    regionFilter?: string,
    categoryFilter?: string,
  ) {
    const filters: any = {};
    if (regionFilter && regionFilter !== "All_View")
      filters.region = regionFilter;
    if (categoryFilter && categoryFilter !== "All_View")
      filters.category = categoryFilter;

    return ControlBaseService.call("frappe.client.get_list", {
      doctype: "SaaS Configuration Item",
      filters: filters,
      fields: [
        "name",
        "category",
        "label",
        "key",
        "region",
        "is_active",
        "description",
      ],
      order_by: "category asc, region asc",
      limit_page_length: 1000,
    });
  }

  static async saveConfigItem(item: ConfigItem) {
    if (item.name) {
      return ControlBaseService.update("SaaS Configuration Item", item.name, {
        category: item.category,
        label: item.label,
        key: item.key,
        region: item.region,
        is_active: item.is_active,
        description: item.description,
      });
    } else {
      return ControlBaseService.insert({
        doctype: "SaaS Configuration Item",
        category: item.category,
        label: item.label,
        key: item.key,
        region: item.region,
        is_active: item.is_active,
        description: item.description,
      });
    }
  }

  static async deleteConfigItem(name: string) {
    return ControlBaseService.delete("SaaS Configuration Item", name);
  }
}
