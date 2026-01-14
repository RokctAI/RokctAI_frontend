"use server";

import { revalidatePath } from "next/cache";
import { DatabasesService } from "@/app/services/control/rpanel/databases/databases";

export async function getDatabases(clientName?: string) {
    try {
        const res = await DatabasesService.getClientDatabases(clientName);
        return { message: res.message || res };
    } catch (e: any) {
        return { message: { success: false, error: e.message } };
    }
}

export async function updateDatabasePassword(websiteName: string, newPassword: string) {
    try {
        const res = await DatabasesService.updateDatabasePassword(websiteName, newPassword);

        if (res.exc) throw new Error(JSON.stringify(res.exc));

        revalidatePath("/rpanel/databases");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
