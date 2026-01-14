"use server";

import { WebsitesService } from "@/app/services/control/rpanel/websites/websites";

export async function getClientWebsites(clientName?: string) {
    try {
        const res = await WebsitesService.getClientWebsites(clientName);
        return { message: res.message || res };
    } catch (e: any) {
        return { message: { success: false, error: e.message } };
    }
}
