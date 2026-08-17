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
