"use server";

import { revalidatePath } from "next/cache";
import { getPaaSClient } from "@/app/lib/client";

export async function getParcelSettings() {
    const frappe = await getPaaSClient();

    try {
        const settings = await frappe.call({
            method: "paas.api.parcel_order_setting.parcel_order_setting.get_parcel_order_settings"
        });
        return settings;
    } catch (error) {
        console.error("Failed to fetch parcel settings:", error);
        return [];
    }
}

export async function createParcelSetting(data: any) {
    const frappe = await getPaaSClient();

    try {
        const setting = await frappe.call({
            method: "paas.api.parcel_order_setting.parcel_order_setting.create_parcel_order_setting",
            args: {
                setting_data: data
            }
        });
        revalidatePath("/paas/dashboard/settings/parcel");
        return setting;
    } catch (error) {
        console.error("Failed to create parcel setting:", error);
        throw error;
    }
}

export async function updateParcelSetting(name: string, data: any) {
    const frappe = await getPaaSClient();

    try {
        const setting = await frappe.call({
            method: "paas.api.parcel_order_setting.parcel_order_setting.update_parcel_order_setting",
            args: {
                name: name,
                setting_data: data
            }
        });
        revalidatePath("/paas/dashboard/settings/parcel");
        return setting;
    } catch (error) {
        console.error("Failed to update parcel setting:", error);
        throw error;
    }
}

export async function deleteParcelSetting(name: string) {
    const frappe = await getPaaSClient();

    try {
        await frappe.call({
            method: "paas.api.parcel_order_setting.parcel_order_setting.delete_parcel_order_setting",
            args: {
                name: name
            }
        });
        revalidatePath("/paas/dashboard/settings/parcel");
        return { success: true };
    } catch (error) {
        throw error;
    }
}

// Parcel Orders

export async function getParcelOrders(limit = 20, offset = 0) {
    const frappe = await getPaaSClient();

    try {
        const orders = await frappe.call({
            method: "paas.api.parcel.parcel.get_parcel_orders",
            args: { limit, offset }
        });
        return orders;
    } catch (error) {
        console.error("Failed to fetch parcel orders:", error);
        return [];
    }
}

export async function getParcelOrder(name: string) {
    const frappe = await getPaaSClient();

    try {
        const order = await frappe.call({
            method: "paas.api.parcel.parcel.get_user_parcel_order",
            args: { name }
        });
        return order;
    } catch (error) {
        console.error("Failed to fetch parcel order:", error);
        return null;
    }
}

export async function updateParcelStatus(name: string, status: string) {
    const frappe = await getPaaSClient();

    try {
        const order = await frappe.call({
            method: "paas.api.parcel.parcel.update_parcel_status",
            args: {
                parcel_order_id: name,
                status: status
            }
        });
        revalidatePath("/paas/dashboard/orders/parcels");
        return order;
    } catch (error) {
        console.error("Failed to update parcel status:", error);
        throw error;
    }
}
