"use server";

import { verifyLendingRole } from "@/app/lib/roles";
import { revalidatePath } from "next/cache";
import { DecisionService } from "@/app/services/all/lending/decision";

export async function runDecisionEngine(applicationId: string) {
    if (!applicationId) return { success: false, message: "Application ID is required" };

    // Auth Check
    if (!await verifyLendingRole()) return { success: false, message: "Unauthorized" };

    try {
        const data = await DecisionService.runEngine(applicationId);
        revalidatePath(`/handson/all/lending/application/${applicationId}`);
        return { success: true, data: data };
    } catch (e: any) {
        console.error("Decision Engine Failed:", e);
        return { success: false, message: e?.message || "Failed to run decision engine" };
    }
}
