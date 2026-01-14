"use server";

import { SettingsService } from "@/app/services/tenant/settings";
import { revalidatePath } from "next/cache";

export async function getCompanySettings() {
    return SettingsService.getCompanySettings();
}

export async function updateCompanySettings(data: any) {
    const doc = await SettingsService.updateCompanySettings(data);
    revalidatePath("/handson/tenant/settings");
    return doc;
}
