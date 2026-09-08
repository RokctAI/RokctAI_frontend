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

import { auth } from "@/app/(auth)/auth";
import {
  AiTaskDispatchResult,
  AiTaskResult,
  AiTaskService,
  AiTaskType,
} from "@/app/services/all/agent/tasks";

// Session-gated (any authenticated user); the backend validates the task
// type and routes to its worker queues.
async function verifySession() {
  const session = await auth();
  return !!session?.user?.email;
}

export async function dispatchAiTask(
  taskType: AiTaskType,
  data: Record<string, unknown>,
) {
  if (!(await verifySession()))
    return { data: null as AiTaskDispatchResult | null, error: "Unauthorized" };

  try {
    const result = await AiTaskService.dispatchAiTask(taskType, data);
    return { data: result };
  } catch (e: any) {
    console.error("Failed to dispatch AI task", e);
    return {
      data: null as AiTaskDispatchResult | null,
      error: e?.message || "Failed to dispatch AI task",
    };
  }
}

export async function getAiResult(jobId: string) {
  if (!(await verifySession()))
    return { data: null as AiTaskResult | null, error: "Unauthorized" };

  try {
    const data = await AiTaskService.getAiResult(jobId);
    return { data };
  } catch (e) {
    console.error("Failed to fetch AI result", e);
    return { data: null as AiTaskResult | null, error: "Failed to fetch AI result" };
  }
}
