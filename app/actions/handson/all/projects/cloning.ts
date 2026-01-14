"use server";

import { revalidatePath } from "next/cache";
import { ProjectService } from "@/app/services/all/projects/projects";
import { z } from "zod";

const CloneProjectSchema = z.object({
    projectId: z.string().min(1, "Project ID is required"),
    newName: z.string().min(1, "New Name is required"),
});

export async function cloneProject(projectId: string, newName: string) {
    const result = CloneProjectSchema.safeParse({ projectId, newName });
    if (!result.success) {
        return { success: false, error: result.error.errors[0].message };
    }

    try {
        const newId = await ProjectService.clone(projectId, newName);
        revalidatePath("/handson/all/projects");
        return { success: true, message: "Project cloned successfully", projectId: newId };
    } catch (e: any) {
        console.error("Failed to clone project", e);
        return { success: false, error: e.message || "Cloning failed" };
    }
}
