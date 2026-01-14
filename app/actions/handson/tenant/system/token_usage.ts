"use server";

import { SystemService } from "@/app/services/tenant/system";

export async function getTokenUsageLogs() {
    return SystemService.getTokenUsageLogs();
}
