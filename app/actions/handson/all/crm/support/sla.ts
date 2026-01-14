"use server";

import { verifyCrmRole } from "@/app/lib/roles";
import { SupportService } from "@/app/services/all/crm/support";
import { SLASchema, SLAData } from "./types";



export async function getServiceLevelAgreements() {
    if (!await verifyCrmRole()) return [];
    try {
        return await SupportService.getServiceLevelAgreements();
    } catch (e) { return []; }
}

export async function createServiceLevelAgreement(data: SLAData) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };

    const validation = SLASchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    try {
        const result = await SupportService.createServiceLevelAgreement(data);
        return { success: true, message: result };
    } catch (e: any) {
        return { success: false, error: e?.message || "Error" };
    }
}
