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

import { BaseService } from "@/app/services/common/base";
import { CostCenterData } from "@/app/actions/handson/all/accounting/cost_centers/types";

export class CostCenterService {
  static async getList(options?: any) {
    return BaseService.getList("Cost Center", {
      fields: ["name", "cost_center_name", "parent_cost_center"],
      limit_page_length: 50,
      ...options,
    });
  }

  static async create(data: CostCenterData) {
    return BaseService.insert({ doctype: "Cost Center", ...data });
  }
}
