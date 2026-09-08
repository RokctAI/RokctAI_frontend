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
import { InvoiceData } from "@/app/actions/handson/all/accounting/invoices/types";

export class InvoiceService {
  static async get(name: string) {
    return BaseService.getDoc("Sales Invoice", name);
  }

  static async getList(options?: any) {
    return BaseService.getList("Sales Invoice", {
      fields: ["name", "customer_name", "grand_total", "status", "due_date"],
      limit_page_length: 50,
      order_by: "creation desc",
      ...options,
    });
  }

  static async create(data: InvoiceData) {
    return BaseService.insert({ doctype: "Sales Invoice", ...data });
  }

  static async update(name: string, data: Partial<InvoiceData>) {
    return BaseService.setValue("Sales Invoice", name, data);
  }

  static async delete(name: string) {
    return BaseService.delete("Sales Invoice", name);
  }

  static async submit(name: string) {
    return BaseService.submit({ doctype: "Sales Invoice", name: name });
  }

  static async cancel(name: string) {
    return BaseService.cancel("Sales Invoice", name);
  }
}
