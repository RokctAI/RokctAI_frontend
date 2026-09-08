/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
    return {
      success: true,
      message: "Project cloned successfully",
      projectId: newId,
    };
  } catch (e: any) {
    console.error("Failed to clone project", e);
    return { success: false, error: e.message || "Cloning failed" };
  }
}
