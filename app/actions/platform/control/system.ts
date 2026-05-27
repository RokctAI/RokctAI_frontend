// @ts-nocheck
/**
 * Generated Server Actions for Platform Module: control, Group: system
 * Author: ROKCT Code Generator
 */
"use server";

import { SystemService } from "@/app/services/platform/control/system";
import { revalidatePath } from "next/cache";

/**
 * Trigger control plane graceful system reboot
 */
export async function reboot(payload?: any) {
  try {
    const result = await SystemService.reboot(payload);
    return result;
  } catch (error) {
    console.error("Failed to execute Server Action reboot:", error);
    throw error;
  }
}
