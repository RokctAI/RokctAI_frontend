"use server";

import { paasCall } from "@/app/lib/paas-gateway";
import { revalidatePath } from "next/cache";

// --- Kitchens ---

export async function getKitchens() {
  try {
    return await paasCall("api.seller_operations.get_seller_kitchens");
  } catch (error) {
    console.error("Failed to fetch kitchens:", error);
    return [];
  }
}

export async function createKitchen(data: any) {
  try {
    const kitchen = await paasCall("api.seller_operations.create_seller_kitchen", { kitchen_data: data });
    revalidatePath("/paas/dashboard/restaurant/kitchens");
    return kitchen;
  } catch (error) {
    console.error("Failed to create kitchen:", error);
    throw error;
  }
}

export async function updateKitchen(name: string, data: any) {
  try {
    const kitchen = await paasCall("api.seller_operations.update_seller_kitchen", { kitchen_name: name, kitchen_data: data });
    revalidatePath("/paas/dashboard/restaurant/kitchens");
    return kitchen;
  } catch (error) {
    console.error("Failed to update kitchen:", error);
    throw error;
  }
}

export async function deleteKitchen(name: string) {
  try {
    await paasCall("api.seller_operations.delete_seller_kitchen", { kitchen_name: name });
    revalidatePath("/paas/dashboard/restaurant/kitchens");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete kitchen:", error);
    throw error;
  }
}

// --- Menus ---

export async function getMenus() {
  try {
    return await paasCall("api.seller_operations.get_seller_menus");
  } catch (error) {
    console.error("Failed to fetch menus:", error);
    return [];
  }
}

export async function createMenu(data: any) {
  try {
    const menu = await paasCall("api.seller_operations.create_seller_menu", { menu_data: data });
    revalidatePath("/paas/dashboard/products/menus");
    return menu;
  } catch (error) {
    console.error("Failed to create menu:", error);
    throw error;
  }
}

export async function deleteMenu(name: string) {
  try {
    await paasCall("api.seller_operations.delete_seller_menu", { menu_name: name });
    revalidatePath("/paas/dashboard/products/menus");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete menu:", error);
    throw error;
  }
}

// --- Combos ---

export async function getCombos() {
  try {
    return await paasCall("api.seller_operations.get_seller_combos");
  } catch (error) {
    console.error("Failed to fetch combos:", error);
    return [];
  }
}

export async function createCombo(data: any) {
  try {
    const combo = await paasCall("api.seller_operations.create_seller_combo", { combo_data: data });
    revalidatePath("/paas/dashboard/products/combos");
    return combo;
  } catch (error) {
    console.error("Failed to create combo:", error);
    throw error;
  }
}

export async function deleteCombo(name: string) {
  try {
    await paasCall("api.seller_operations.delete_seller_combo", { combo_name: name });
    revalidatePath("/paas/dashboard/products/combos");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete combo:", error);
    throw error;
  }
}
