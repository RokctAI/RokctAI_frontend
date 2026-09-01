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
