"use server";

import { SettingsService } from "@/app/services/tenant/settings";
import { revalidatePath } from "next/cache";

export async function getTenantEmailSettings() {
    return SettingsService.getTenantEmailSettings();
}

export async function updateTenantEmailSettings(data: any) {
    const doc = await SettingsService.updateTenantEmailSettings(data);
    revalidatePath("/handson/tenant/settings");
    return doc;
}
