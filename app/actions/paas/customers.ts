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

"use server";

import { paasCall } from "@/app/lib/paas-gateway";

export async function getCustomers(page: number = 1, perPage: number = 20) {
  try {
    const start = (page - 1) * perPage;
    const customers = await paasCall(
      "api.seller_customer_management.get_seller_customers",
      {
        limit_start: start,
        limit_page_length: perPage,
      },
    );
    return customers;
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return [];
  }
}

export async function getCustomerDetails(customerId: string) {
  try {
    const customer = await paasCall(
      "api.seller_customer_management.get_customer_details",
      {
        customer_id: customerId,
      },
    );
    return customer;
  } catch (error) {
    console.error("Failed to fetch customer details:", error);
    throw error;
  }
}
