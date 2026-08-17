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
import { getCurrentEmployeeId } from "@/app/lib/roles";
import { ExpenseService } from "@/app/services/all/hrms/expenses";
import type { ExpenseClaimData } from "@/app/services/all/hrms/expenses";

export type { ExpenseClaimData };

export async function getMyExpenseClaims() {
  const employeeId = await getCurrentEmployeeId();
  if (!employeeId) return [];

  try {
    return await ExpenseService.getClaims({ employee: employeeId });
  } catch (e) {
    return [];
  }
}

export async function createMyExpenseClaim(data: ExpenseClaimData) {
  const employeeId = await getCurrentEmployeeId();
  if (!employeeId)
    return { success: false, error: "Employee record not found" };

  try {
    const result = await ExpenseService.createClaim({
      ...data,
      employee: employeeId,
    });
    revalidatePath("/handson/all/hrms/me/expenses");
    return {
      success: true,
      message: "Expense Claim created",
      name: result.name,
    };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || "Failed to create Expense Claim",
    };
  }
}
