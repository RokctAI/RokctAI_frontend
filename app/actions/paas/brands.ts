"use server";

import { revalidatePath } from "next/cache";
import { getPaaSClient } from "@/app/lib/client";

export async function getBrands() {
    const frappe = await getPaaSClient();

    try {
        const shop = await frappe.call({
            method: "paas.api.user.user.get_user_shop"
        });

        const brands = await frappe.call({
            method: "paas.api.brand.brand.get_brands",
            args: {
                limit_start: 0,
                limit_page_length: 100
            }
        });

        // Filter brands for current shop
        return brands.filter((b: any) => b.shop === shop.name);
    } catch (error) {
        console.error("Failed to fetch brands:", error);
        return [];
    }
}

export async function createBrand(data: any) {
    const frappe = await getPaaSClient();

    try {
        const shop = await frappe.call({
            method: "paas.api.user.user.get_user_shop"
        });

        const brand = await frappe.call({
            method: "paas.api.brand.brand.create_brand",
            args: {
                brand_data: {
                    ...data,
                    shop: shop.name
                }
            }
        });
        revalidatePath("/paas/dashboard/content/brands");
        return brand;
    } catch (error) {
        console.error("Failed to create brand:", error);
        throw error;
    }
}

export async function updateBrand(uuid: string, data: any) {
    const frappe = await getPaaSClient();

    try {
        const brand = await frappe.call({
            method: "paas.api.brand.brand.update_brand",
            args: {
                uuid: uuid,
                brand_data: data
            }
        });
        revalidatePath("/paas/dashboard/content/brands");
        return brand;
    } catch (error) {
        console.error("Failed to update brand:", error);
        throw error;
    }
}

export async function deleteBrand(uuid: string) {
    const frappe = await getPaaSClient();

    try {
        await frappe.call({
            method: "paas.api.brand.brand.delete_brand",
            args: {
                uuid: uuid
            }
        });
        revalidatePath("/paas/dashboard/content/brands");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete brand:", error);
        throw error;
    }
}
