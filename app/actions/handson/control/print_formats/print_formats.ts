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
