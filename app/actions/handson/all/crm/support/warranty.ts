"use server";

import { revalidatePath } from "next/cache";
import { verifyCrmRole } from "@/app/lib/roles";
import { SupportService } from "@/app/services/all/crm/support";

export async function getWarrantyClaims() {
    if (!await verifyCrmRole()) return [];
    try {
        return await SupportService.getWarrantyClaims();
    } catch (e) { return []; }
}

export async function createWarrantyClaim(data: { customer: string; item_code: string; issue_date: string; description: string }) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    try {
        const result = await SupportService.createWarrantyClaim(data);
        revalidatePath("/handson/all/crm/support/warranty");
        return { success: true, message: result };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}
