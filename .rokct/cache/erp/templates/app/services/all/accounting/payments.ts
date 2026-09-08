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
import { PaymentData } from "@/app/actions/handson/all/accounting/payments/types";

export class PaymentService {
  static async getList(options?: any) {
    return BaseService.getList("Payment Entry", {
      fields: [
        "name",
        "party_name",
        "payment_type",
        "paid_amount",
        "status",
        "posting_date",
        "clearance_date",
      ],
      limit_page_length: 50,
      order_by: "creation desc",
      ...options,
    });
  }

  static async create(data: PaymentData) {
    return BaseService.insert({ doctype: "Payment Entry", ...data });
  }

  static async get(name: string) {
    return BaseService.getDoc("Payment Entry", name);
  }

  static async cancel(name: string) {
    return BaseService.cancel("Payment Entry", name);
  }

  static async setClearanceDate(name: string, date: string) {
    return BaseService.setValue("Payment Entry", name, {
      clearance_date: date,
    });
  }
}
