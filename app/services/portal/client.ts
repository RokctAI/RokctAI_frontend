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

import { getClient } from "@/app/lib/client";

export class ClientPortalService {
  /**
   * Fetch user details by email using Admin Key access.
   */
  static async getUserByEmail(email: string) {
    const frappe = await getClient();
    const users = await (frappe.db() as any).get_list("User", {
      filters: { email: email },
      fields: ["name", "email", "full_name"],
    });
    return users.length > 0 ? users[0] : null;
  }

  /**
   * Fetch Telephony Customer linked to a User.
   */
  static async getTelephonyCustomer(userName: string) {
    const frappe = await getClient();
    const customers = await (frappe.db() as any).get_list(
      "Telephony Customer",
      {
        filters: { user: userName },
        fields: ["name", "balance", "customer_name"],
      },
    );
    return customers.length > 0 ? customers[0] : null;
  }

  /**
   * Fetch Telephony Subscriptions for a Customer.
   */
  static async getTelephonySubscriptions(customerName: string) {
    const frappe = await getClient();
    return await (frappe.db() as any).get_list("Telephony Subscription", {
      filters: { customer: customerName },
      fields: ["name", "plan", "status", "did_number", "number_of_lines"],
    });
  }

  /**
   * Fetch Hosting (Company) Subscriptions by Primary Email.
   * Maps Email -> Customer (primary_email) -> Company Subscriptions.
   */
  static async getHostingSubscriptions(email: string) {
    const frappe = await getClient();

    // Find Customer by email
    const customers = await (frappe.db() as any).get_list("Customer", {
      filters: { customer_primary_email: email },
      fields: ["name", "customer_name"],
    });

    if (!customers || customers.length === 0) return [];

    const customerName = customers[0].name;

    // Fetch Subscriptions
    return await (frappe.db() as any).get_list("Company Subscription", {
      filters: { customer: customerName },
      fields: ["name", "plan", "status", "site_name", "next_billing_date"],
    });
  }
}
