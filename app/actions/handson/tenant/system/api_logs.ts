"use server";

import { SystemService } from "@/app/services/tenant/system";
import { revalidatePath } from "next/cache";

export async function getApiErrorLogs() {
    return SystemService.getApiErrorLogs();
}

export async function getApiErrorLog(name: string) {
    return SystemService.getApiErrorLog(name);
}

export async function deleteApiErrorLog(name: string) {
    await SystemService.deleteApiErrorLog(name);
    revalidatePath("/handson/tenant/system");
}
