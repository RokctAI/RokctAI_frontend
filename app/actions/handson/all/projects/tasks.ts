"use server";

import { revalidatePath } from "next/cache";
import { TaskService } from "@/app/services/all/projects/tasks";

export async function getTasks() {
    try {
        return await TaskService.getList();
    } catch (e) {
        console.error("Failed to fetch Tasks", e);
        return [];
    }
}

export async function createTask(data: any) {
    try {
        const result = await TaskService.create(data);
        revalidatePath("/handson/all/projects");
        return { success: true, message: result };
    } catch (e: any) {
        console.error("Failed to create Task", e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}

export async function getUsers() {
    try {
        return await TaskService.getUsers();
    } catch (e) {
        console.error("Failed to fetch Users", e);
        return [];
    }
}
