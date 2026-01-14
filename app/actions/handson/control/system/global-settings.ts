"use server";

import { GlobalSettingsService } from "@/app/services/control/global_settings";
import { revalidatePath } from "next/cache";

export async function getGlobalSettings() {
    return GlobalSettingsService.getGlobalSettings();
}

export async function toggleBetaMode() {
    const result = await GlobalSettingsService.toggleBetaMode();
    if (result.success) {
        revalidatePath("/");
    }
    return result;
}

export async function toggleDebugMode() {
    const result = await GlobalSettingsService.toggleDebugMode();
    if (result.success) {
        revalidatePath("/");
    }
    return result;
}
