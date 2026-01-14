"use server";

import { revalidatePath } from "next/cache";

import { getPaaSClient } from "@/app/lib/client";

export async function getOrders(page: number = 1, limit: number = 20, type: string = "", status: string = "") {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;

    const filters: any = {};
    if (type && type !== "all") filters.order_type = type;
    if (status && status !== "all") filters.status = status;

    try {
        return await frappe.call({
            method: "paas.api.admin_records.admin_records.get_all_orders",
            args: { limit_start: start, limit_page_length: limit, filters: filters }
        });
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return [];
    }
}

export async function getOrderStatuses() {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "paas.api.admin_settings.admin_settings.get_order_statuses"
        });
    } catch (error) {
        console.error("Failed to fetch order statuses:", error);
        return [];
    }
}

export async function updateOrderStatus(name: string, status: string) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "paas.api.admin_records.admin_records.update_order_status",
            args: { order_name: name, status: status }
        });
        revalidatePath("/paas/admin/orders");
        return { success: true };
    } catch (error) {
        console.error("Failed to update order status:", error);
        throw error;
    }
}

export async function getParcelOrders(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_records.admin_records.get_all_parcel_orders",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch parcel orders:", error);
        return [];
    }
}

export async function getRefunds(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_records.admin_records.get_all_order_refunds",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch refunds:", error);
        return [];
    }
}

export async function updateRefund(name: string, status: string, answer?: string) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "paas.api.admin_records.admin_records.update_admin_order_refund",
            args: { refund_name: name, status, answer }
        });
        revalidatePath("/paas/admin/orders/refunds");
        return { success: true };
    } catch (error) {
        console.error("Failed to update refund:", error);
        throw error;
    }
}

export async function getBookings(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_records.admin_records.get_all_bookings",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch bookings:", error);
        return [];
    }
}

export async function getOrderReviews(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_records.admin_records.get_all_order_reviews",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch order reviews:", error);
        return [];
    }
}
