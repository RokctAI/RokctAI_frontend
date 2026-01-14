"use server";

import { StorageService } from "@/app/services/tenant/storage";

export async function getStorageUsage() {
    return StorageService.getStorageUsage();
}
