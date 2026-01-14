"use server";

import { revalidatePath } from "next/cache";
import { verifyHrRole } from "@/app/lib/roles";
import { DesignationService, DesignationData } from "@/app/services/all/hrms/designations";

export type { DesignationData };

export async function getDesignations() {
    if (!await verifyHrRole()) return [];
    try {
        return await DesignationService.getList();
    } catch (e) {
        console.error("Failed to fetch Designations", e);
        return [];
    }
}

export async function createDesignation(data: DesignationData) {
    if (!await verifyHrRole()) return { success: false, error: "Unauthorized" };
    try {
        const result = await DesignationService.create(data);
        revalidatePath("/handson/all/hrms/me/employees");
        return { success: true, message: result };
    } catch (e: any) {
        console.error("Failed to create Designation", e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
