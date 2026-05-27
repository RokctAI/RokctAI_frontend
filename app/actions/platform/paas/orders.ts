// @ts-nocheck
/**
 * Generated Server Actions for Platform Module: paas, Group: orders
 * Author: ROKCT Code Generator
 */
"use server";

import { OrdersService } from "@/app/services/platform/paas/orders";
import { revalidatePath } from "next/cache";

/**
 * Fetch list of client orders
 */
export async function list(payload?: any) {
  try {
    const result = await OrdersService.list(payload);
    return result;
  } catch (error) {
    console.error("Failed to execute Server Action list:", error);
    throw error;
  }
}
