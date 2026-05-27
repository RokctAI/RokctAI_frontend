// @ts-nocheck
/**
 * Generated Server Actions for Platform Module: lending, Group: operations
 * Author: ROKCT Code Generator
 */
"use server";

import { OperationsService } from "@/app/services/platform/lending/operations";
import { revalidatePath } from "next/cache";

/**
 * Run interest accrual for term loans
 */
export async function runInterestAccrual(payload?: any) {
  try {
    const result = await OperationsService.runInterestAccrual(payload);
    return result;
  } catch (error) {
    console.error("Failed to execute Server Action runInterestAccrual:", error);
    throw error;
  }
}
