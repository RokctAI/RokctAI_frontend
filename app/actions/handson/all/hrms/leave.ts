"use server";

import { revalidatePath } from "next/cache";
import { verifyHrRole } from "@/app/lib/roles";
import { LeaveService } from "@/app/services/all/hrms/leave";
import type { LeaveApplicationData } from "@/app/services/all/hrms/leave";

export async function getLeaveTypes() {
    if (!await verifyHrRole()) return [];
    try {
        return await LeaveService.getLeaveTypes();
    } catch (e) {
        return [];
    }
}

export async function getLeaveAllocations(employee: string) {
    if (!await verifyHrRole()) return [];
    try {
        return await LeaveService.getLeaveAllocations(employee);
    } catch (e) {
        return [];
    }
}

export async function getHolidays(year?: string) {
    if (!await verifyHrRole()) return [];
    try {
        return await LeaveService.getHolidays(year);
    } catch (e) {
        return [];
    }
}

export async function getLeaveApplications() {
    if (!await verifyHrRole()) return [];
    try {
        return await LeaveService.getLeaveApplications();
    } catch (e) {
        console.error("Failed to fetch Leave Applications", e);
        return [];
    }
}

export async function createLeaveApplication(data: any) {
    if (!await verifyHrRole()) return { success: false, error: "Unauthorized" };
    try {
        await LeaveService.createLeaveApplication(data);

        revalidatePath("/handson/all/hrms/leave");
        revalidatePath("/handson/all/hrms/me/leave");
        return { success: true, message: "Leave Application created" };
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to create leave application" };
    }
}
