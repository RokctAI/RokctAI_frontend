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
