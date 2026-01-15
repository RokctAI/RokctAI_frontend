"use server";

import { revalidatePath } from "next/cache";
import { verifyHrRole } from "@/app/lib/roles";
import { AdvanceService, type EmployeeAdvanceData } from "@/app/services/all/hrms/advances";

export type { EmployeeAdvanceData };

export async function getEmployeeAdvances() {
    if (!await verifyHrRole()) return [];
    try {
        return await AdvanceService.getList();
    } catch (e) {
        return [];
    }
}

export async function createEmployeeAdvance(data: EmployeeAdvanceData) {
    if (!await verifyHrRole()) return { success: false, error: "Unauthorized" };
    try {
        const result = await AdvanceService.create(data);
        revalidatePath("/handson/all/hrms/advances");
        return { success: true, message: "Employee Advance created", name: result.name };
    } catch (e: any) {
        return { success: false, error: e?.message || "Failed to create Employee Advance" };
    }
}
