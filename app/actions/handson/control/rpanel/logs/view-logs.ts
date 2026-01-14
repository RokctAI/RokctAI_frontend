'use server'

import { revalidatePath } from "next/cache";
import { LogsService } from "@/app/services/control/rpanel/logs/logs";

export async function getLogStats(website: string) {
    try {
        const response = await LogsService.getLogStats(website);
        return response.message || response;
    } catch (error: any) {
        console.error("Error fetching log stats:", error);
        return { success: false, error: error.message || "Failed to fetch log stats" };
    }
}

export async function getLogContent(website: string, logType: string, lines: number = 100) {
    try {
        const response = await LogsService.getLogContent(website, logType, lines);
        return response.message || response;
    } catch (error: any) {
        console.error("Error fetching log content:", error);
        return { success: false, error: error.message || "Failed to fetch log content" };
    }
}

export async function clearLog(website: string, logType: string) {
    try {
        const response = await LogsService.clearLog(website, logType);

        revalidatePath(`/rpanel/websites/${website}/logs`);
        return response.message || response;
    } catch (error: any) {
        console.error("Error clearing log:", error);
        return { success: false, error: error.message || "Failed to clear log" };
    }
}
