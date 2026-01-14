"use server";

import { revalidatePath } from "next/cache";

import { getPaaSClient } from "@/app/lib/client";

export async function getDeliveryStatistics() {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "paas.api.delivery_man.delivery_man.get_deliveryman_statistics"
        });
    } catch (error) {
        console.error("Failed to fetch statistics:", error);
        return null;
    }
}

export async function getDeliveryOrders(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.delivery_man.delivery_man.get_deliveryman_orders",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return [];
    }
}

export async function getParcelOrders(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.delivery_man.delivery_man.get_deliveryman_parcel_orders",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch parcel orders:", error);
        return [];
    }
}

export async function getDeliverySettings() {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "paas.api.delivery_man.delivery_man.get_deliveryman_settings"
        });
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return {};
    }
}

export async function updateDeliverySettings(settings: any) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "paas.api.delivery_man.delivery_man.update_deliveryman_settings",
            args: { settings_data: settings }
        });
        revalidatePath("/paas/dashboard/delivery/profile");
        return { success: true };
    } catch (error) {
        console.error("Failed to update settings:", error);
        throw error;
    }
}

export async function getPayouts(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.delivery_man.delivery_man.get_payment_to_partners",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch payouts:", error);
        return [];
    }
}

export async function getDeliveryZones() {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "paas.api.delivery_man.delivery_man.get_deliveryman_delivery_zones"
        });
    } catch (error) {
        console.error("Failed to fetch delivery zones:", error);
        return [];
    }
}
