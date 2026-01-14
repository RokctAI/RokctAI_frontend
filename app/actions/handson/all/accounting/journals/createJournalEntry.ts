"use server";

import { revalidatePath } from "next/cache";
import { JournalService } from "@/app/services/all/accounting/journals";
import { JournalEntryData } from "./types";

export async function createJournalEntry(data: JournalEntryData) {
    try {
        const response = await JournalService.create(data);
        revalidatePath("/handson/all/accounting");
        return { success: true, message: response?.message };
    } catch (e: any) {
        console.error("Failed to create Journal Entry", e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
