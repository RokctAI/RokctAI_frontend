"use server";

import { paasCall } from "@/app/lib/paas-gateway";

export async function getCustomers(page: number = 1, perPage: number = 20) {
  try {
    const start = (page - 1) * perPage;
    const customers = await paasCall("api.seller_customer_management.get_seller_customers", {
        limit_start: start,
        limit_page_length: perPage,
      });
    return customers;
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return [];
  }
}

export async function getCustomerDetails(customerId: string) {
  try {
    const customer = await paasCall("api.seller_customer_management.get_customer_details", {
        customer_id: customerId,
      });
    return customer;
  } catch (error) {
    console.error("Failed to fetch customer details:", error);
    throw error;
  }
}
