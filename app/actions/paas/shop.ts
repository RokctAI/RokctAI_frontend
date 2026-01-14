"use server";

import { getPaaSClient } from "@/app/lib/client";

export async function getShop() {
    const frappe = await getPaaSClient();

    try {
        const shop = await frappe.call({
            method: "paas.api.seller_shop.seller_shop.get_shop",
        });
        return shop;
    } catch (error) {
        console.error("Failed to fetch shop:", error);
        return null;
    }
}

export async function updateShop(data: any) {
    const frappe = await getPaaSClient();

    try {
        const shop = await frappe.call({
            method: "paas.api.seller_shop.seller_shop.update_shop",
            args: {
                shop_data: data
            }
        });
        return shop;
    } catch (error) {
        console.error("Failed to update shop:", error);
        throw error;
    }
}

export async function setWorkingStatus(status: boolean) {
    const frappe = await getPaaSClient();

    try {
        const result = await frappe.call({
            method: "paas.api.seller_shop.seller_shop.set_working_status",
            args: {
                status: status
            }
        });
        return result;
    } catch (error) {
        console.error("Failed to set working status:", error);
        throw error;
    }
}

export async function getShops() {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Shop",
                fields: ["name", "shop_name"],
                limit_page_length: 50
            }
        });
    } catch (error) {
        console.error("Failed to fetch shops:", error);
        return [];
    }
}
