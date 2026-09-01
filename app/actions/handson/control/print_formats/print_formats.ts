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

import { PrintFormatService } from "@/app/services/control/print_formats";
import type { MasterPrintFormat } from "@/app/services/control/print_formats";
import { revalidatePath } from "next/cache";

export type { MasterPrintFormat };

/**
 * Fetches all Print Formats from the Control Site.
 */
export async function getMasterPrintFormats(doctype?: string) {
  return PrintFormatService.getMasterPrintFormats(doctype);
}

/**
 * Creates or Updates a Master Print Format.
 */
export async function saveMasterPrintFormat(
  name: string,
  doctype: string,
  html: string,
) {
  await PrintFormatService.saveMasterPrintFormat(name, doctype, html);
  revalidatePath("/handson/control/print-formats");
  return { success: true };
}

export async function deleteMasterPrintFormat(name: string) {
  await PrintFormatService.deleteMasterPrintFormat(name);
  revalidatePath("/handson/control/print-formats");
  return { success: true };
}
