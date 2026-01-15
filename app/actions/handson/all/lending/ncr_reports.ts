"use server";

import { verifyLendingRole, verifyLendingLicense } from "@/app/lib/roles";
import { NCRService } from "@/app/services/all/lending/ncr";
import type { NCRForm40Data } from "@/app/services/all/lending/ncr";

export type { NCRForm40Data };

export async function getNCRForm40Data(filters: any = {}) {
    if (!await verifyLendingRole()) {
        if (!await verifyLendingLicense()) return { data: null, error: "Company must be a registered Credit Provider." };
        return { data: null, error: "Unauthorized" };
    }

    try {
        const data = await NCRService.getForm40Data(filters);
        return { data, error: null };
    } catch (e: any) {
        console.error("NCR Data Fetch Error", e);
        return { data: null, error: e?.message || "Failed to generate NCR data" };
    }
}
