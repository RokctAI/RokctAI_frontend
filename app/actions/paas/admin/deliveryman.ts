"use server";

import { revalidatePath } from "next/cache";

import { getPaaSClient } from "@/app/lib/client";

export async function getDeliveries(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_logistics.admin_logistics.get_all_deliveries",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch deliveries:", error);
        return [];
    }
}

export async function getDeliveryStatistics() {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "paas.api.admin_logistics.admin_logistics.get_delivery_statistics"
        });
    } catch (error) {
        console.error("Failed to fetch delivery statistics:", error);
        return {};
    }
}

export async function getDeliverymanReviews(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_logistics.admin_logistics.get_deliveryman_reviews",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch deliveryman reviews:", error);
        return [];
    }
}

export async function getDeliverymanRequests(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_logistics.admin_logistics.get_deliveryman_requests",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch deliveryman requests:", error);
        return [];
    }
}

export async function updateDeliverymanRequest(name: string, status: string) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "paas.api.admin_logistics.admin_logistics.update_deliveryman_request",
            args: { request_name: name, status: status }
        });
        revalidatePath("/paas/admin/deliveryman/requests");
        return { success: true };
    } catch (error) {
        console.error("Failed to update deliveryman request:", error);
        throw error;
    }
}
