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

import { getSystemControlClient } from "@/app/lib/client";

export interface ProviderTicketData {
  subject: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
}

export class SupportService {
  static async getProviderTickets(tenantId: string) {
    const control = await getSystemControlClient();
    try {
      const response = await (control.db() as any).get_list("Issue", {
        filters: { customer: tenantId },
        fields: ["name", "subject", "status", "priority", "creation"],
        order_by: "creation desc",
      });
      return response || [];
    } catch (e) {
      console.error("Failed to fetch provider tickets", e);
      return [];
    }
  }

  static async submitProviderTicket(
    tenantId: string,
    data: ProviderTicketData,
  ) {
    const control = await getSystemControlClient();
    return (control.db() as any).create_doc("Issue", {
      subject: `[${tenantId}] ${data.subject}`,
      description: data.description,
      priority: data.priority,
      customer: tenantId,
      issue_type: "Technical Support",
      raised_by: "system@tenant.com",
    });
  }
}
