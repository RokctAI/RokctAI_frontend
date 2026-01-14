"use server";

import { verifyCrmRole } from "@/app/lib/roles";
import { SupportService } from "@/app/services/all/crm/support";

export async function getNotes() {
    if (!await verifyCrmRole()) return [];
    try {
        return await SupportService.getNotes();
    } catch (e) { return []; }
}

export async function createNote(data: any) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    try {
        const result = await SupportService.createNote(data);
        return { success: true, message: result };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}
