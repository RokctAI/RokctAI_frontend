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
// import { applyGlobalWorkflows } from "@/app/actions/handson/control/workflows";
import { InvoiceService } from "@/app/services/all/accounting/invoices";
import { InvoiceData } from "./types";

export async function createInvoice(data: InvoiceData) {
  try {
    // 1. Apply Global Workflow Rules (Blocks or Modifies)
    // const finalData = await applyGlobalWorkflows("Sales Invoice", data);
    const finalData = data; // Bypass workflow for now as function is missing

    const response = await InvoiceService.create(finalData);
    revalidatePath("/handson/all/accounting");
    return { success: true, message: response?.message };
  } catch (e: any) {
    console.error("Failed to create Invoice", e);
    const msg = e.message?.includes("[Workflow Block]")
      ? e.message.replace("Error: ", "")
      : e?.message || "Unknown error";
    return { success: false, error: msg };
  }
}
