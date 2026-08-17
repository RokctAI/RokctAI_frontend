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
import { verifyHrRole } from "@/app/lib/roles";
import { ExpenseService } from "@/app/services/all/hrms/expenses";
import type { ExpenseClaimData } from "@/app/services/all/hrms/expenses";

export async function getExpenseClaimTypes() {
  if (!(await verifyHrRole())) return [];
  try {
    return await ExpenseService.getClaimTypes();
  } catch (e) {
    return [];
  }
}

export async function getExpenseClaims() {
  if (!(await verifyHrRole())) return [];
  try {
    return await ExpenseService.getClaims();
  } catch (e) {
    return [];
  }
}

export async function createExpenseClaim(data: ExpenseClaimData) {
  if (!(await verifyHrRole())) return { success: false, error: "Unauthorized" };
  try {
    const result = await ExpenseService.createClaim(data);
    revalidatePath("/handson/all/hrms/expenses");
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
