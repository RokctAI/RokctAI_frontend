"use server";

import { revalidatePath } from "next/cache";
import { getCurrentEmployeeId } from "@/app/lib/roles";
import { AttendanceService, AttendanceData } from "@/app/services/all/hrms/attendance";

export type { AttendanceData };

export async function getMyAttendanceList() {
    const employeeId = await getCurrentEmployeeId();
    if (!employeeId) return [];

    try {
        return await AttendanceService.getList({ employee: employeeId });
    } catch (e) {
        return [];
    }
}

export async function markMyAttendance(data: AttendanceData) {
    const employeeId = await getCurrentEmployeeId();
    if (!employeeId) return { success: false, error: "Employee record not found" };

    try {
        await AttendanceService.create({
            ...data,
            employee: employeeId
        });
        revalidatePath("/handson/all/hrms/me/attendance");
        return { success: true, message: "Attendance marked" };
    } catch (e: any) {
        return { success: false, error: e?.message || "Failed to mark attendance" };
    }
}
