"use server";

import { revalidatePath } from "next/cache";
import { getCurrentEmployeeId } from "@/app/lib/roles";
import { LeaveService, LeaveApplicationData } from "@/app/services/all/hrms/leave";

export type { LeaveApplicationData };

export async function getMyLeaveApplications() {
    const employeeId = await getCurrentEmployeeId();
    if (!employeeId) return [];

    try {
        return await LeaveService.getLeaveApplications({ employee: employeeId });
    } catch (e) {
        console.error("Failed to fetch Leave Applications", e);
        return [];
    }
}

export async function createMyLeaveApplication(data: LeaveApplicationData) {
    const employeeId = await getCurrentEmployeeId();
    if (!employeeId) return { success: false, error: "Employee record not found" };

    try {
        await LeaveService.createLeaveApplication({
            ...data,
            employee: employeeId
        });
        revalidatePath("/handson/all/hrms/me/leave");
        return { success: true, message: "Leave Application created" };
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to create leave application" };
    }
}
