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
