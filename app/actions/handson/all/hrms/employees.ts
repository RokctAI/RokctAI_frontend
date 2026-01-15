"use server";

import { revalidatePath } from "next/cache";
import { verifyHrRole } from "@/app/lib/roles";
import { EmployeeService } from "@/app/services/all/hrms/employees";
import type { EmployeeData } from "@/app/services/all/hrms/employees";

export async function getEmployees() {
    if (!await verifyHrRole()) return [];
    try {
        return await EmployeeService.getList();
    } catch (e) {
        console.error("Failed to fetch Employees", e);
        return [];
    }
}

export async function getEmployee(name: string) {
    if (!await verifyHrRole()) return null;
    try {
        return await EmployeeService.get(name);
    } catch (e) {
        console.error(`Failed to fetch Employee ${name}`, e);
        return null;
    }
}

export async function createEmployee(data: EmployeeData) {
    if (!await verifyHrRole()) return { success: false, error: "Unauthorized" };
    try {
        const result = await EmployeeService.create(data);
        revalidatePath("/handson/all/hrms/me/employees");
        return { success: true, message: result };
    } catch (e: any) {
        console.error("Failed to create Employee", e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}

export async function updateEmployee(name: string, data: Partial<EmployeeData>) {
    if (!await verifyHrRole()) return { success: false, error: "Unauthorized" };
    try {
        const result = await EmployeeService.update(name, data);
        revalidatePath("/handson/all/hrms/me/employees");
        return { success: true, message: result };
    } catch (e: any) {
        console.error(`Failed to update Employee ${name}`, e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
