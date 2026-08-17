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
