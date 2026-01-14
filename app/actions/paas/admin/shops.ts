"use server";

import { revalidatePath } from "next/cache";

import { getPaaSClient } from "@/app/lib/client";

export async function getShops(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_management.admin_management.get_all_shops",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch shops:", error);
        return [];
    }
}

export async function createShop(data: any) {
    const frappe = await getPaaSClient();
    try {
        const shop = await frappe.call({
            method: "paas.api.admin_management.admin_management.create_shop",
            args: { shop_data: data }
        });
        revalidatePath("/paas/admin/shops");
        return shop;
    } catch (error) {
        console.error("Failed to create shop:", error);
        throw error;
    }
}

export async function updateShop(name: string, data: any) {
    const frappe = await getPaaSClient();
    try {
        const shop = await frappe.call({
            method: "paas.api.admin_management.admin_management.update_shop",
            args: { shop_name: name, shop_data: data }
        });
        revalidatePath("/paas/admin/shops");
        return shop;
    } catch (error) {
        console.error("Failed to update shop:", error);
        throw error;
    }
}

export async function deleteShop(name: string) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "paas.api.admin_management.admin_management.delete_shop",
            args: { shop_name: name }
        });
        revalidatePath("/paas/admin/shops");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete shop:", error);
        throw error;
    }
}

export async function getShopCategories(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_data.admin_data.get_all_shop_categories",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch shop categories:", error);
        return [];
    }
}

export async function getShopReviews(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_records.admin_records.get_all_shop_reviews",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch shop reviews:", error);
        return [];
    }
}

export async function getShopTags(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_data.admin_data.get_all_shop_tags",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch shop tags:", error);
        return [];
    }
}

export async function getShopUnits(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_data.admin_data.get_all_units",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch shop units:", error);
        return [];
    }
}

export async function getShopTypes() {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "paas.api.get_shop_types"
        });
    } catch (error) {
        console.error("Failed to fetch shop types:", error);
        return [];
    }
}
