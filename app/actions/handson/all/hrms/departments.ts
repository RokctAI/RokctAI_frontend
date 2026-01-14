"use server";

import { revalidatePath } from "next/cache";
import { verifyHrRole } from "@/app/lib/roles";
import { DepartmentService, DepartmentData } from "@/app/services/all/hrms/departments";

export type { DepartmentData };

export async function getDepartments() {
    if (!await verifyHrRole()) return [];
    try {
        return await DepartmentService.getList();
    } catch (e) {
        console.error("Failed to fetch Departments", e);
        return [];
    }
}

export async function createDepartment(data: DepartmentData) {
    if (!await verifyHrRole()) return { success: false, error: "Unauthorized" };
    try {
        const result = await DepartmentService.create(data);
        revalidatePath("/handson/all/hrms/me/employees");
        return { success: true, message: result };
    } catch (e: any) {
        console.error("Failed to create Department", e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
