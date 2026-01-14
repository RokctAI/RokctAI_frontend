"use server";

import { SettingsService } from "@/app/services/tenant/settings";
import { revalidatePath } from "next/cache";

export async function getSynapticSettings() {
    return SettingsService.getSynapticSettings();
}

export async function updateSynapticSettings(data: any) {
    const doc = await SettingsService.updateSynapticSettings(data);
    revalidatePath("/handson/tenant/settings");
    return doc;
}

export async function getStimulusCategories() {
    return SettingsService.getStimulusCategories();
}
