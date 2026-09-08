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
import { JournalEntryData } from "@/app/actions/handson/all/accounting/journals/types";

export class JournalService {
  static async getList(options?: any) {
    return BaseService.getList("Journal Entry", {
      fields: [
        "name",
        "voucher_type",
        "posting_date",
        "total_debit",
        "docstatus",
      ],
      limit_page_length: 50,
      order_by: "creation desc",
      ...options,
    });
  }

  static async getGLList(options?: any) {
    return BaseService.getList("GL Entry", {
      fields: [
        "name",
        "posting_date",
        "account",
        "party_type",
        "party",
        "debit",
        "credit",
        "voucher_type",
        "voucher_no",
      ],
      limit_page_length: 100,
      order_by: "posting_date desc, creation desc",
      ...options,
    });
  }

  static async create(data: JournalEntryData) {
    return BaseService.insert({ doctype: "Journal Entry", ...data });
  }

  static async setClearanceDate(name: string, date: string) {
    return BaseService.setValue("Journal Entry", name, {
      clearance_date: date,
    });
  }
}
