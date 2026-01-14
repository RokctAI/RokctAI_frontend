"use server";

import { revalidatePath } from "next/cache";
import { getCurrentEmployeeId } from "@/app/lib/roles";
import { EmployeeService, EmployeeData } from "@/app/services/all/hrms/employees";
import { EmployeeProfileSchema, EmployeeProfileData } from "./types";



export async function getMyProfile() {
    const employeeId = await getCurrentEmployeeId();
    if (!employeeId) return null;

    try {
        return await EmployeeService.get(employeeId);
    } catch (e) {
        return null;
    }
}

export async function updateMyProfile(data: Partial<EmployeeProfileData>) {
    const employeeId = await getCurrentEmployeeId();
    if (!employeeId) return { success: false, error: "Unauthorized" };

    try {
        await EmployeeService.update(employeeId, data as Partial<EmployeeData>);
        revalidatePath("/handson/all/hrms/me/employees");
        return { success: true, message: "Profile updated successfully" };
    } catch (e: any) {
        console.error("Update Profile Error:", e);
        return { success: false, error: e?.message || "Failed to update profile. Please ensure ID and Bank details are valid." };
    }
}
