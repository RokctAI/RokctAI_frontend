"use server";

import { JournalService } from "@/app/services/all/accounting/journals";

export async function getGLEntries(filters?: any) {
    try {
        const list = await JournalService.getGLList({ filters: filters || {} });
        return list;
    } catch (e) {
        console.error("Failed to fetch GL Entries", e);
        return [];
    }
}
