"use server";

import { verifyLendingRole } from "@/app/lib/roles";
import { RefundService } from "@/app/services/all/lending/refund";

export async function createLoanRefund(data: { loan: string; amount: number; type: "Excess" | "Security" }) {
    if (!await verifyLendingRole()) return { success: false, error: "Unauthorized" };

    try {
        const refund = await RefundService.create(data);
        return { success: true, message: `Refund ${refund.name} Processed` };
    } catch (e: any) {
        console.error("Refund Failed", e);
        return { success: false, error: e.message || "Failed to process refund" };
    }
}
