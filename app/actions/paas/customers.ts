"use server";

import { getPaaSClient } from "@/app/lib/client";

export async function getCustomers(page: number = 1, perPage: number = 20) {
    const frappe = await getPaaSClient();

    try {
        const start = (page - 1) * perPage;
        const customers = await frappe.call({
            method: "paas.api.seller_customer_management.seller_customer_management.get_seller_customers",
            args: {
                limit_start: start,
                limit_page_length: perPage
            }
        });
        return customers;
    } catch (error) {
        console.error("Failed to fetch customers:", error);
        return [];
    }
}

export async function getCustomerDetails(customerId: string) {
    const frappe = await getPaaSClient();

    try {
        const customer = await frappe.call({
            method: "paas.api.seller_customer_management.seller_customer_management.get_customer_details",
            args: {
                customer_id: customerId
            }
        });
        return customer;
    } catch (error) {
        console.error("Failed to fetch customer details:", error);
        throw error;
    }
}
