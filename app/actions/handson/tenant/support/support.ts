/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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

import { SupportService } from "@/app/services/tenant/support";
import type { ProviderTicketData } from "@/app/services/tenant/support";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers"; // Re-export if used elsewhere, or just import from service

/**
 * Fetches tickets raised by this Tenant from the Control Site.
 * We match Issue.raised_by = <Current Tenant ID/Email> or Issue.customer = <Tenant Company>
 */
export async function getProviderTickets() {
  // In a real multi-tenant setup, we need a reliable way to identify "This Tenant".
  // For this prototype, we will assume the Tenant is identified by "Rokct"
  const TENANT_ID = "Rokct";
  return SupportService.getProviderTickets(TENANT_ID);
}

export async function submitProviderTicket(data: ProviderTicketData) {
  // Dynamic Tenant ID from Host
  const headersList = await headers();
  const host = headersList.get("host") || "unknown.tenant";
  // Remove .rokct.ai or .localhost:3000 to get the "site name"
  // Example: juvo.tenant.rokct.ai -> juvo.tenant
  const tenantId = host.split(".rokct.ai")[0].split(":")[0];

  try {
    await SupportService.submitProviderTicket(tenantId, data);

    revalidatePath("/handson/tenant/support");
    return { success: true };
  } catch (e: any) {
    console.error("Failed to submit provider ticket", e);
    return { success: false, error: e?.message || "Failed to submit ticket" };
  }
}
