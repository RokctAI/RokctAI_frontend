"use server";

import { revalidatePath } from "next/cache";
import { getPaaSClient } from "@/app/lib/client";

// --- Kitchens ---

export async function getKitchens() {
    const frappe = await getPaaSClient();

    try {
        return await frappe.call({
            method: "paas.api.seller_operations.seller_operations.get_seller_kitchens"
        });
    } catch (error) {
        console.error("Failed to fetch kitchens:", error);
        return [];
    }
}

export async function createKitchen(data: any) {
    const frappe = await getPaaSClient();

    try {
        const kitchen = await frappe.call({
            method: "paas.api.seller_operations.seller_operations.create_seller_kitchen",
            args: { kitchen_data: data }
        });
        revalidatePath("/paas/dashboard/restaurant/kitchens");
        return kitchen;
    } catch (error) {
        console.error("Failed to create kitchen:", error);
        throw error;
    }
}

export async function updateKitchen(name: string, data: any) {
    const frappe = await getPaaSClient();

    try {
        const kitchen = await frappe.call({
            method: "paas.api.seller_operations.seller_operations.update_seller_kitchen",
            args: { kitchen_name: name, kitchen_data: data }
        });
        revalidatePath("/paas/dashboard/restaurant/kitchens");
        return kitchen;
    } catch (error) {
        console.error("Failed to update kitchen:", error);
        throw error;
    }
}

export async function deleteKitchen(name: string) {
    const frappe = await getPaaSClient();

    try {
        await frappe.call({
            method: "paas.api.seller_operations.seller_operations.delete_seller_kitchen",
            args: { kitchen_name: name }
        });
        revalidatePath("/paas/dashboard/restaurant/kitchens");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete kitchen:", error);
        throw error;
    }
}

// --- Menus ---

export async function getMenus() {
    const frappe = await getPaaSClient();

    try {
        return await frappe.call({
            method: "paas.api.seller_operations.seller_operations.get_seller_menus"
        });
    } catch (error) {
        console.error("Failed to fetch menus:", error);
        return [];
    }
}

export async function createMenu(data: any) {
    const frappe = await getPaaSClient();

    try {
        const menu = await frappe.call({
            method: "paas.api.seller_operations.seller_operations.create_seller_menu",
            args: { menu_data: data }
        });
        revalidatePath("/paas/dashboard/products/menus");
        return menu;
    } catch (error) {
        console.error("Failed to create menu:", error);
        throw error;
    }
}

export async function deleteMenu(name: string) {
    const frappe = await getPaaSClient();

    try {
        await frappe.call({
            method: "paas.api.seller_operations.seller_operations.delete_seller_menu",
            args: { menu_name: name }
        });
        revalidatePath("/paas/dashboard/products/menus");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete menu:", error);
        throw error;
    }
}

// --- Combos ---

export async function getCombos() {
    const frappe = await getPaaSClient();

    try {
        return await frappe.call({
            method: "paas.api.seller_operations.seller_operations.get_seller_combos"
        });
    } catch (error) {
        console.error("Failed to fetch combos:", error);
        return [];
    }
}

export async function createCombo(data: any) {
    const frappe = await getPaaSClient();

    try {
        const combo = await frappe.call({
            method: "paas.api.seller_operations.seller_operations.create_seller_combo",
            args: { combo_data: data }
        });
        revalidatePath("/paas/dashboard/products/combos");
        return combo;
    } catch (error) {
        console.error("Failed to create combo:", error);
        throw error;
    }
}

export async function deleteCombo(name: string) {
    const frappe = await getPaaSClient();

    try {
        await frappe.call({
            method: "paas.api.seller_operations.seller_operations.delete_seller_combo",
            args: { combo_name: name }
        });
        revalidatePath("/paas/dashboard/products/combos");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete combo:", error);
        throw error;
    }
}
