"use server";

import { revalidatePath } from "next/cache";
import { verifyHrRole } from "@/app/lib/roles";
import { PayrollService } from "@/app/services/all/hrms/payroll";

export async function getSalarySlips() {
    if (!await verifyHrRole()) return [];
    try {
        return await PayrollService.getSalarySlips();
    } catch (e) {
        console.error("Failed to fetch Salary Slips", e);
        return [];
    }
}

export async function getSalarySlip(name: string) {
    if (!await verifyHrRole()) return null;
    try {
        return await PayrollService.getSalarySlip(name);
    } catch (e) {
        return null;
    }
}

export async function getSalaryStructures() {
    if (!await verifyHrRole()) return [];
    try {
        return await PayrollService.getSalaryStructures();
    } catch (e) {
        return [];
    }
}

export async function createSalarySlip(data: any) {
    if (!await verifyHrRole()) return { success: false, error: "Unauthorized" };
    try {
        const result = await PayrollService.createSalarySlip(data);
        revalidatePath("/handson/all/hrms/payroll");
        return { success: true, message: "Salary Slip created", name: result.name };
    } catch (e: any) {
        return { success: false, error: e?.message || "Error creating Salary Slip" };
    }
}
