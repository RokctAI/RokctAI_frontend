"use server";

import { paasCall } from "@/app/lib/paas-gateway";
import { revalidatePath } from "next/cache";


export async function getDeliverySettings() {
  try {
    return await paasCall("api.admin_logistics.get_deliveryman_global_settings");
  } catch (error) {
    console.error("Failed to fetch delivery settings:", error);
    return {};
  }
}

export async function updateDeliverySettings(settings: any) {
  try {
    await paasCall("api.admin_logistics.update_deliveryman_global_settings", { settings_data: settings });
    revalidatePath("/paas/admin/logistics/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update delivery settings:", error);
    throw error;
  }
}

export async function getVehicleTypes(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_logistics.get_delivery_vehicle_types", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch vehicle types:", error);
    return [];
  }
}

export async function createVehicleType(data: any) {
  try {
    await paasCall("api.admin_logistics.create_delivery_vehicle_type", { type_data: data });
    revalidatePath("/paas/admin/logistics/vehicles");
    return { success: true };
  } catch (error) {
    console.error("Failed to create vehicle type:", error);
    throw error;
  }
}

export async function deleteVehicleType(name: string) {
  try {
    await paasCall("api.admin_logistics.delete_delivery_vehicle_type", { type_name: name });
    revalidatePath("/paas/admin/logistics/vehicles");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete vehicle type:", error);
    throw error;
  }
}

export async function getDeliveryZones(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_logistics.get_all_delivery_zones", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch delivery zones:", error);
    return [];
  }
}
