"use server";

import { revalidatePath } from "next/cache";

import { getPaaSClient } from "@/app/lib/client";

export async function getDeliverySettings() {
    const frappe = await getPaaSClient();
    try {
        return await frappe.call({
            method: "paas.api.admin_logistics.admin_logistics.get_deliveryman_global_settings"
        });
    } catch (error) {
        console.error("Failed to fetch delivery settings:", error);
        return {};
    }
}

export async function updateDeliverySettings(settings: any) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "paas.api.admin_logistics.admin_logistics.update_deliveryman_global_settings",
            args: { settings_data: settings }
        });
        revalidatePath("/paas/admin/logistics/settings");
        return { success: true };
    } catch (error) {
        console.error("Failed to update delivery settings:", error);
        throw error;
    }
}

export async function getVehicleTypes(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_logistics.admin_logistics.get_delivery_vehicle_types",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch vehicle types:", error);
        return [];
    }
}

export async function createVehicleType(data: any) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "paas.api.admin_logistics.admin_logistics.create_delivery_vehicle_type",
            args: { type_data: data }
        });
        revalidatePath("/paas/admin/logistics/vehicles");
        return { success: true };
    } catch (error) {
        console.error("Failed to create vehicle type:", error);
        throw error;
    }
}

export async function deleteVehicleType(name: string) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "paas.api.admin_logistics.admin_logistics.delete_delivery_vehicle_type",
            args: { type_name: name }
        });
        revalidatePath("/paas/admin/logistics/vehicles");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete vehicle type:", error);
        throw error;
    }
}

export async function getDeliveryZones(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_logistics.admin_logistics.get_all_delivery_zones",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch delivery zones:", error);
        return [];
    }
}
