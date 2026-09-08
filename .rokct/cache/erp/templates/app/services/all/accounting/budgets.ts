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
import { BudgetData } from "@/app/actions/handson/all/accounting/budgets/types";

export class BudgetService {
  static async getList(options?: any) {
    return BaseService.getList("Budget", {
      fields: [
        "name",
        "budget_against",
        "cost_center",
        "project",
        "fiscal_year",
      ],
      limit_page_length: 50,
      ...options,
    });
  }

  static async create(data: BudgetData) {
    return BaseService.insert({ doctype: "Budget", ...data });
  }
}
