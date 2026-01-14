"use server";

import { revalidatePath } from "next/cache";
import { TimesheetService } from "@/app/services/all/projects/timesheets";

export async function getTimesheets() {
    try {
        return await TimesheetService.getList();
    } catch (e) {
        console.error("Failed to fetch Timesheets", e);
        return [];
    }
}

export async function createTimesheet(data: any) {
    try {
        const result = await TimesheetService.create(data);
        revalidatePath("/handson/all/projects");
        return { success: true, message: result };
    } catch (e: any) {
        console.error("Failed to create Timesheet", e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}

export async function getActivityTypes() {
    try {
        return await TimesheetService.getActivityTypes();
    } catch (e) { return []; }
}

export async function createActivityType(data: any) {
    try {
        const result = await TimesheetService.createActivityType(data);
        return { success: true, message: result };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}
