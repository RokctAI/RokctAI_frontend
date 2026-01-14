"use server";

import { getPaaSClient } from "@/app/lib/client";

export async function getWorkingHours() {
    const frappe = await getPaaSClient();

    try {
        const hours = await frappe.call({
            method: "paas.api.seller_shop_settings.seller_shop_settings.get_seller_shop_working_days",
        });
        return hours;
    } catch (error) {
        console.error("Failed to fetch working hours:", error);
        return [];
    }
}

export async function updateWorkingHours(data: any) {
    const frappe = await getPaaSClient();

    try {
        const result = await frappe.call({
            method: "paas.api.seller_shop_settings.seller_shop_settings.update_seller_shop_working_days",
            args: {
                working_days_data: data
            }
        });
        return result;
    } catch (error) {
        console.error("Failed to update working hours:", error);
        throw error;
    }
}
