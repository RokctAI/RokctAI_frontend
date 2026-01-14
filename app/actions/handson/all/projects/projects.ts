"use server";

import { revalidatePath } from "next/cache";
import { ProjectService } from "@/app/services/all/projects/projects";

export interface ProjectData {
    project_name: string;
    status?: string;
    priority?: string;
    expected_start_date?: string;
    expected_end_date?: string;
    percent_complete?: number;
}

export async function getProject(name: string) {
    try {
        const result = await ProjectService.get(name);
        return result;
    } catch (e) {
        console.error(`Failed to fetch Project ${name}`, e);
        return null;
    }
}

export async function createProject(data: ProjectData) {
    try {
        const result = await ProjectService.create(data);
        revalidatePath("/handson/all/projects");
        return { success: true, message: result };
    } catch (e: any) {
        console.error("Failed to create Project", e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}

export async function updateProject(name: string, data: Partial<ProjectData>) {
    try {
        const result = await ProjectService.update(name, data);
        revalidatePath("/handson/all/projects");
        return { success: true, message: result };
    } catch (e: any) {
        console.error(`Failed to update Project ${name}`, e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}

export async function deleteProject(name: string) {
    try {
        await ProjectService.delete(name);
        revalidatePath("/handson/all/projects");
        return { success: true };
    } catch (e: any) {
        console.error(`Failed to delete Project ${name}`, e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}

export async function getProjects() {
    try {
        return await ProjectService.getList();
    } catch (e) {
        console.error("Failed to fetch Projects", e);
        return [];
    }
}
