"use server";

import { revalidatePath } from "next/cache";
import { getCurrentEmployeeId } from "@/app/lib/roles";
import { PerformanceService } from "@/app/services/all/hrms/performance";

export async function getGoals() {
    const employeeId = await getCurrentEmployeeId();
    if (!employeeId) return [];

    try {
        return await PerformanceService.getGoals({ employee: employeeId });
    } catch (e) {
        console.error("Failed to fetch Goals", e);
        return [];
    }
}

export async function saveGoal(data: any) {
    const employeeId = await getCurrentEmployeeId();
    if (!employeeId) return { success: false, error: "Unauthorized" };

    try {
        let doc;
        if (data.name) {
            await PerformanceService.updateGoal(data.name, data);
            doc = { name: data.name, ...data };
        } else {
            doc = await PerformanceService.createGoal({ ...data, employee: employeeId });
        }
        revalidatePath("/handson/all/hrms/me/performance");
        return { success: true, data: doc };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getAppraisals() {
    const employeeId = await getCurrentEmployeeId();
    if (!employeeId) return [];

    try {
        return await PerformanceService.getAppraisals({ employee: employeeId });
    } catch (e) {
        console.error("Failed to fetch Appraisals", e);
        return [];
    }
}

export async function submitAppraisal(data: any) {
    const employeeId = await getCurrentEmployeeId();
    if (!employeeId) return { success: false, error: "Unauthorized" };

    try {
        let doc;
        if (data.name) {
            await PerformanceService.updateAppraisal(data.name, data);
            doc = { name: data.name, ...data };
        } else {
            doc = await PerformanceService.createAppraisal({ ...data, employee: employeeId });
        }
        revalidatePath("/handson/all/hrms/me/performance");
        return { success: true, data: doc };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
