"use server";

import { JournalService } from "@/app/services/all/accounting/journals";

export async function getJournalEntries() {
    try {
        const list = await JournalService.getList();
        return list;
    } catch (e) {
        console.error("Failed to fetch Journal Entries", e);
        return [];
    }
}
