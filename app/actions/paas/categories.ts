"use server";

import { revalidatePath } from "next/cache";
import { getPaaSClient } from "@/app/lib/client";

export async function getCategories() {
    const frappe = await getPaaSClient();

    try {
        const shop = await frappe.call({
            method: "paas.api.user.user.get_user_shop"
        });

        if (!shop) {
            return [];
        }

        const categories = await frappe.call({
            method: "paas.api.category.category.get_categories",
            args: {
                shop_id: shop.name
            }
        });
        return categories;
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
    }
}

export async function createCategory(data: any) {
    const frappe = await getPaaSClient();

    try {
        const shop = await frappe.call({
            method: "paas.api.user.user.get_user_shop"
        });

        const category = await frappe.call({
            method: "paas.api.category.category.create_category",
            args: {
                category_data: {
                    ...data,
                    shop: shop.name
                }
            }
        });
        revalidatePath("/paas/dashboard/products/categories");
        return category;
    } catch (error) {
        console.error("Failed to create category:", error);
        throw error;
    }
}

export async function updateCategory(id: string, data: any) {
    const frappe = await getPaaSClient();

    try {
        const category = await frappe.call({
            method: "paas.api.category.category.update_category",
            args: {
                category_id: id,
                category_data: data
            }
        });
        revalidatePath("/paas/dashboard/products/categories");
        return category;
    } catch (error) {
        console.error("Failed to update category:", error);
        throw error;
    }
}

export async function deleteCategory(id: string) {
    const frappe = await getPaaSClient();

    try {
        await frappe.call({
            method: "paas.api.category.category.delete_category",
            args: {
                category_id: id
            }
        });
        revalidatePath("/paas/dashboard/products/categories");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete category:", error);
        throw error;
    }
}
