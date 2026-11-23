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
  CommitPlanResult,
  PlanBuilderService,
} from "@/app/services/all/agent/plan";

// Session-gated (any authenticated user).
async function verifySession() {
  const session = await auth();
  return !!session?.user?.email;
}

export async function commitPlan(params: {
  planData?: string;
  profileType?: string;
  instanceName?: string;
}) {
  if (!(await verifySession())) return { success: false, error: "Unauthorized" };

  try {
    const result = await PlanBuilderService.commitPlan(params);
    return { success: true, result };
  } catch (e: any) {
    console.error("Failed to commit plan", e);
    return { success: false, error: e?.message || "Failed to commit plan" };
  }
}
