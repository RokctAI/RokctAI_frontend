"use server";

import { revalidatePath } from "next/cache";
import { getPaaSClient } from "@/app/lib/client";

// --- Extra Groups ---

export async function getExtraGroups() {
    const frappe = await getPaaSClient();

    try {
        const shop = await frappe.call({
            method: "paas.api.user.user.get_user_shop"
        });

        const groups = await frappe.call({
            method: "paas.api.product_extra.product_extra.get_extra_groups",
            args: {
                shop_id: shop.name
            }
        });
        return groups;
    } catch (error) {
        console.error("Failed to fetch extra groups:", error);
        return [];
    }
}

export async function createExtraGroup(data: any) {
    const frappe = await getPaaSClient();

    try {
        const shop = await frappe.call({
            method: "paas.api.user.user.get_user_shop"
        });

        const group = await frappe.call({
            method: "paas.api.product_extra.product_extra.create_extra_group",
            args: {
                data: {
                    ...data,
                    shop: shop.name
                }
            }
        });
        revalidatePath("/paas/dashboard/products/extras");
        return group;
    } catch (error) {
        console.error("Failed to create extra group:", error);
        throw error;
    }
}

export async function updateExtraGroup(name: string, data: any) {
    const frappe = await getPaaSClient();

    try {
        const group = await frappe.call({
            method: "paas.api.product_extra.product_extra.update_extra_group",
            args: {
                name: name,
                data: data
            }
        });
        revalidatePath("/paas/dashboard/products/extras");
        return group;
    } catch (error) {
        console.error("Failed to update extra group:", error);
        throw error;
    }
}

export async function deleteExtraGroup(name: string) {
    const frappe = await getPaaSClient();

    try {
        await frappe.call({
            method: "paas.api.product_extra.product_extra.delete_extra_group",
            args: {
                name: name
            }
        });
        revalidatePath("/paas/dashboard/products/extras");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete extra group:", error);
        throw error;
    }
}

// --- Extra Values ---

export async function getExtraValues(groupId: string) {
    const frappe = await getPaaSClient();

    try {
        const values = await frappe.call({
            method: "paas.api.product_extra.product_extra.get_extra_values",
            args: {
                group_id: groupId
            }
        });
        return values;
    } catch (error) {
        console.error("Failed to fetch extra values:", error);
        return [];
    }
}

export async function createExtraValue(data: any) {
    const frappe = await getPaaSClient();

    try {
        const value = await frappe.call({
            method: "paas.api.product_extra.product_extra.create_extra_value",
            args: {
                data: data
            }
        });
        revalidatePath("/paas/dashboard/products/extras");
        return value;
    } catch (error) {
        console.error("Failed to create extra value:", error);
        throw error;
    }
}

export async function deleteExtraValue(name: string) {
    const frappe = await getPaaSClient();

    try {
        await frappe.call({
            method: "paas.api.product_extra.product_extra.delete_extra_value",
            args: {
                name: name
            }
        });
        revalidatePath("/paas/dashboard/products/extras");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete extra value:", error);
        throw error;
    }
}
