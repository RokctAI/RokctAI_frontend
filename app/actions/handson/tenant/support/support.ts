"use server";

import { SupportService } from "@/app/services/tenant/support";
import type { ProviderTicketData } from "@/app/services/tenant/support";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export type { ProviderTicketData }; // Re-export if used elsewhere, or just import from service

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
