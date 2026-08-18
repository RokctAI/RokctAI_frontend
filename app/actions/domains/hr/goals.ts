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

/**
 * Canonical HR Goals domain actions — the exemplar for converging the
 * duplicated action families onto app/lib/action-kit.ts.
 *
 * Both entry-point families now import from here:
 *   - app/actions/handson/all/hrms/performance.ts re-exports the hands-on
 *     page actions (HR-role guarded, org-wide, revalidating the page).
 *   - app/actions/ai/hr.ts re-exports the AI actions (employee-scoped,
 *     AI-token-quota billed).
 * The cross-cutting concerns (session, role guard, quota billing,
 * revalidation, error trapping) live in the kit; only the domain logic
 * lives here.
 */

import { runAction, runQuery } from "@/app/lib/action-kit";
import { getClient } from "@/app/lib/client";
import { gatewayCall } from "@/app/lib/gateway-rpc";
import { getCurrentEmployeeId, verifyHrRole } from "@/app/lib/roles";
import { PerformanceService } from "@/app/services/all/hrms/performance";

const PERFORMANCE_PATH = "/handson/all/hrms/performance";

// --- Hands-on (page) entry points: HR-role guarded, org-wide ---

export async function getAllGoals() {
  return runQuery(
    { role: verifyHrRole },
    () => PerformanceService.getGoals(),
    [] as any[],
    "fetch Goals",
  );
}

export async function createGoal(data: any) {
  return runAction(
    {
      role: verifyHrRole,
      revalidate: PERFORMANCE_PATH,
      fallbackError: "Failed to create Goal",
    },
    async () => {
      const result = await PerformanceService.createGoal(data);
      return { message: "Goal created successfully", data: result };
    },
  );
}

export async function updateGoal(name: string, data: any) {
  return runAction(
    {
      role: verifyHrRole,
      revalidate: PERFORMANCE_PATH,
      fallbackError: "Failed to update Goal",
    },
    async () => {
      await PerformanceService.updateGoal(name, data);
      return { message: "Goal updated successfully" };
    },
  );
}

// --- AI (chat) entry points: same domain, employee-scoped, quota-billed ---

export async function createAiGoal(data: {
  description: string;
  start_date?: string;
  end_date?: string;
  modelId?: string;
}) {
  return runAction(
    { ai: { modelId: data.modelId }, fallbackError: "Unknown error" },
    async () => {
      const employee = await getCurrentEmployeeId();
      if (!employee) {
        throw new Error("Employee record not found for your user.");
      }

      const client = await getClient();
      const response = await gatewayCall(client, "frappe.client.insert", {
        doc: {
          doctype: "Goal",
          employee: employee,
          goal: data.description,
          start_date: data.start_date || new Date().toISOString().split("T")[0],
          end_date: data.end_date,
          status: "Open",
        },
      });

      if (!response?.message) {
        throw new Error("No response from backend");
      }
      return { message: response.message };
    },
  );
}

export async function getAiGoals(data: { modelId?: string } = {}) {
  // Reads are not quota-billed today (matches the previous behavior).
  return runAction({ fallbackError: "Unknown error" }, async () => {
    const employee = await getCurrentEmployeeId();
    if (!employee) {
      throw new Error("Employee not found");
    }

    const client = await getClient();
    const goals = await gatewayCall(client, "frappe.client.get_list", {
      doctype: "Goal",
      filters: { employee: employee },
      fields: ["name", "goal", "status", "progress", "end_date"],
      limit_page_length: 10,
    });

    return { goals: goals?.message || [] };
  });
}
