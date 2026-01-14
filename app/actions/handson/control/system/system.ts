"use server";

import { SystemService } from "@/app/services/control/system";
import { revalidatePath } from "next/cache";

// --- Brain Settings ---

export async function getBrainSettings() {
    return SystemService.getBrainSettings();
}

export async function updateBrainSettings(name: string, data: any) {
    const doc = await SystemService.updateBrainSettings(name, data);
    revalidatePath("/handson/control/system");
    return doc;
}

// --- Weather Settings ---

export async function getWeatherSettings() {
    return SystemService.getWeatherSettings();
}

export async function updateWeatherSettings(name: string, data: any) {
    const doc = await SystemService.updateWeatherSettings(name, data);
    revalidatePath("/handson/control/system");
    return doc;
}

// --- Update Authorization ---

export async function getUpdateAuthorizations() {
    return SystemService.getUpdateAuthorizations();
}

export async function approveUpdate(name: string) {
    const doc = await SystemService.approveUpdate(name);
    revalidatePath("/handson/control/system/updates");
    return doc;
}

export async function rejectUpdate(name: string) {
    const doc = await SystemService.rejectUpdate(name);
    revalidatePath("/handson/control/system/updates");
    return doc;
}

export async function deleteUpdateAuthorization(name: string) {
    const doc = await SystemService.deleteUpdateAuthorization(name);
    revalidatePath("/handson/control/system");
    return doc;
}
