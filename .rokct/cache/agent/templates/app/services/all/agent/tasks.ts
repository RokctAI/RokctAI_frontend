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

import { BaseService, ServiceOptions } from "@/app/services/common/base";

// Calls agent/agent/frappe's Brain module via its manifest.json whitelisted
// aliases (flat "paas.api.<fn>" namespace). Do not invent a different path.
const NS = "paas.api";

/** Worker queues the backend routes tasks to. */
export type AiTaskType = "vision" | "rcore" | "router";

export interface AiTaskDispatchResult {
  job_id?: string;
  [key: string]: unknown;
}

export interface AiTaskResult {
  status: string;
  [key: string]: unknown;
}

export class AiTaskService {
  static async dispatchAiTask(
    taskType: AiTaskType,
    data: Record<string, unknown>,
    options?: ServiceOptions,
  ): Promise<AiTaskDispatchResult | null> {
    const response = await BaseService.call(
      `${NS}.dispatch_ai_task`,
      { task_type: taskType, data },
      options,
    );
    return response?.message || null;
  }

  /** Poll for an AI worker result; `{ status: "pending" }` until ready. */
  static async getAiResult(
    jobId: string,
    options?: ServiceOptions,
  ): Promise<AiTaskResult | null> {
    const response = await BaseService.call(
      `${NS}.get_ai_result`,
      { job_id: jobId },
      options,
    );
    return response?.message || null;
  }
}
