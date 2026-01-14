"use server";

import { revalidatePath } from "next/cache";

import { getPaaSClient } from "@/app/lib/client";

export async function getPOSProducts(category: string = "", search: string = "", page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_management.admin_management.get_pos_products",
            args: { category, search, limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch POS products:", error);
        return [];
    }
}

export async function getPOSCategories() {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "paas.api.admin_management.admin_management.get_all_categories"
        });
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
    }
}

export async function createPOSOrder(orderData: any) {
    const frappe = await getPaaSClient();
    try {
        const result = await frappe.call({
            method: "paas.api.admin_management.admin_management.create_pos_order",
            args: { order_data: orderData }
        });
        revalidatePath("/paas/admin/pos");
        return { success: true, orderId: result.name };
    } catch (error) {
        console.error("Failed to create POS order:", error);
        throw error;
    }
}
