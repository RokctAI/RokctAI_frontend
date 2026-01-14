"use server";

import { revalidatePath } from "next/cache";
import { verifyHrRole } from "@/app/lib/roles";
import { ShiftService, ShiftAssignmentData } from "@/app/services/all/hrms/shifts";

export type { ShiftAssignmentData };

export async function getShiftTypes() {
    if (!await verifyHrRole()) return [];
    try {
        return await ShiftService.getShiftTypes();
    } catch (e) {
        return [];
    }
}

export async function getShiftAssignments() {
    if (!await verifyHrRole()) return [];
    try {
        return await ShiftService.getShiftAssignments();
    } catch (e) {
        return [];
    }
}

export async function createShiftAssignment(data: ShiftAssignmentData) {
    if (!await verifyHrRole()) return { success: false, error: "Unauthorized" };
    try {
        const result = await ShiftService.createAssignment(data);
        revalidatePath("/handson/all/hrms/shift");
        return { success: true, message: "Shift Assigned successfully", name: result.name };
    } catch (e: any) {
        return { success: false, error: e?.message || "Failed to assign shift" };
    }
}
