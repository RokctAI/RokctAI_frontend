"use server";

import { getPaaSClient } from "@/app/lib/client";

export async function getOrders(page: number = 1, perPage: number = 20, status?: string) {
    const frappe = await getPaaSClient();

    try {
        const start = (page - 1) * perPage;
        const orders = await frappe.call({
            method: "paas.api.seller_order.seller_order.get_seller_orders",
            args: {
                limit_start: start,
                limit_page_length: perPage,
                status: status === "all" ? undefined : status
            }
        });
        return orders;
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return [];
    }
}

export async function getOrder(id: string) {
    const frappe = await getPaaSClient();

    try {
        const order = await frappe.call({
            method: "paas.api.seller_order.seller_order.get_seller_order_details",
            args: {
                order_id: id
            }
        });
        return order;
    } catch (error) {
        console.error("Failed to fetch order:", error);
        return null;
    }
}

export async function updateOrderStatus(id: string, status: string) {
    const frappe = await getPaaSClient();

    try {
        const order = await frappe.call({
            method: "paas.api.seller_order.seller_order.update_seller_order_status",
            args: {
                order_id: id,
                status: status
            }
        });
        return order;
    } catch (error) {
        console.error("Failed to update order status:", error);
        throw error;
    }
}
