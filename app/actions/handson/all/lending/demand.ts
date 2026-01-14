"use server";

import { verifyLendingRole } from "@/app/lib/roles";
import { DemandService } from "@/app/services/all/lending/demand";

export async function createLoanDemand(data: {
    loan: string;
    demand_type: "Penalty" | "Charges";
    amount: number;
    date: string;
    description?: string; // Mapped to demand_subtype usually or remarks
}) {
    if (!await verifyLendingRole()) return { success: false, error: "Unauthorized" };

    try {
        const message = await DemandService.create(data);
        return { success: true, message: `Demand Raised (${message.name})` };
    } catch (e: any) {
        console.error("Demand Creation Failed", e);
        return { success: false, error: e.message || "Failed to raise demand" };
    }
}
