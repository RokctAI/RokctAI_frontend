"use server";

import { revalidatePath } from "next/cache";
import { LoanService } from "@/app/services/all/hrms/loans";

export async function createLoan(data: any) {
    try {
        const result = await LoanService.create(data);
        revalidatePath("/handson/all/hrms/loan");
        return { success: true, message: result };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}

export async function getLoans() {
    try {
        const result = await LoanService.getList();
        return { success: true, message: result };
    } catch (e) { return { success: false, error: "Failed to fetch loans" }; }
}
