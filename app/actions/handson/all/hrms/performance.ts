"use server";

import { revalidatePath } from "next/cache";
import { verifyHrRole } from "@/app/lib/roles";
import { PerformanceService } from "@/app/services/all/hrms/performance";

export async function getAllGoals() {
    if (!await verifyHrRole()) return [];
    try {
        return await PerformanceService.getGoals();
    } catch (e) {
        console.error("Failed to fetch Goals", e);
        return [];
    }
}

export async function createGoal(data: any) {
    if (!await verifyHrRole()) return { success: false, error: "Unauthorized" };
    try {
        const result = await PerformanceService.createGoal(data);
        revalidatePath("/handson/all/hrms/performance");
        return { success: true, message: "Goal created successfully", data: result };
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to create Goal" };
    }
}

export async function updateGoal(name: string, data: any) {
    if (!await verifyHrRole()) return { success: false, error: "Unauthorized" };
    try {
        await PerformanceService.updateGoal(name, data);
        revalidatePath("/handson/all/hrms/performance");
        return { success: true, message: "Goal updated successfully" };
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to update Goal" };
    }
}

export async function getAllAppraisals() {
    if (!await verifyHrRole()) return [];
    try {
        return await PerformanceService.getAppraisals();
    } catch (e) {
        console.error("Failed to fetch Appraisals", e);
        return [];
    }
}

export async function createAppraisal(data: any) {
    if (!await verifyHrRole()) return { success: false, error: "Unauthorized" };
    try {
        const result = await PerformanceService.createAppraisal(data);
        revalidatePath("/handson/all/hrms/performance");
        return { success: true, message: "Appraisal created successfully", data: result };
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to create Appraisal" };
    }
}
