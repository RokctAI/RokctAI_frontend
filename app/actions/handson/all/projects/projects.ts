/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
