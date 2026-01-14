"use server";

import { getClient, getControlClient } from "@/app/lib/client";
import { revalidatePath } from "next/cache";

// --- Province ---

export async function getProvinces() {
    const frappe = await getClient();
    return (frappe.db() as any).get_list("Province", {
        fields: ["name", "province_name"],
        order_by: "name asc"
    });
}

export async function createProvince(data: any) {
    const frappe = await getClient();
    const doc = await (frappe.db() as any).create_doc("Province", data);
    revalidatePath("/handson/all/settings/lookups");
    return doc;
}

export async function deleteProvince(name: string) {
    const frappe = await getClient();
    await (frappe.db() as any).delete_doc("Province", name);
    revalidatePath("/handson/all/settings/lookups");
}

// --- Location Type ---

export async function getLocationTypes() {
    const frappe = await getClient();
    return (frappe.db() as any).get_list("Location Type", {
        fields: ["name", "location_type_name", "industry"],
        order_by: "name asc"
    });
}

export async function createLocationType(data: any) {
    const frappe = await getClient();
    const doc = await (frappe.db() as any).create_doc("Location Type", data);
    revalidatePath("/handson/all/settings/lookups");
    return doc;
}

export async function deleteLocationType(name: string) {
    const frappe = await getClient();
    await (frappe.db() as any).delete_doc("Location Type", name);
    revalidatePath("/handson/all/settings/lookups");
}

// --- Organ of State (already in competitor actions, but good to have here too if needed for lookups page) ---
export async function getOrgans() {
    const frappe = await getControlClient();
    return (frappe.db() as any).get_list("Organ of State", {
        fields: ["name", "organ_name", "type"],
        order_by: "name asc"
    });
}

export async function createOrgan(data: any) {
    const frappe = await getControlClient();
    const doc = await (frappe.db() as any).create_doc("Organ of State", data);
    revalidatePath("/handson/all/settings/lookups");
    return doc;
}

export async function deleteOrgan(name: string) {
    const frappe = await getControlClient();
    await (frappe.db() as any).delete_doc("Organ of State", name);
    revalidatePath("/handson/all/settings/lookups");
}
