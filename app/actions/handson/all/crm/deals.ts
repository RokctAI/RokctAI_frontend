"use server";

import { verifyCrmRole } from "@/app/lib/roles";
import { revalidatePath } from "next/cache";
import { OpportunityService } from "@/app/services/all/crm/deals";

export interface OpportunityData {
    party_name?: string;
    opportunity_from?: "Lead" | "Customer";
    status?: string;
    transaction_date?: string;

}

// Renaming for consistency with file but exporting legacy names for component compatibility
export async function getOpportunities(page = 1, limit = 20) {
    return getDeals(page, limit);
}

export async function getOpportunity(id: string) {
    return getDeal(id);
}

/**
 * Fetches Deals (Opportunities) with pagination.
 * Aliased as getOpportunities for compatibility.
 */
export async function getDeals(page = 1, limit = 20) {
    if (!await verifyCrmRole()) return { data: [], total: 0 };

    try {
        return await OpportunityService.getList(page, limit);
    } catch (e) {
        console.error("Failed to fetch Deals", e);
        return { data: [], total: 0 };
    }
}

/**
 * Fetches a single Deal (Opportunity) by ID.
 * Aliased as getOpportunity.
 */
export async function getDeal(id: string) {
    if (!await verifyCrmRole()) return { data: null, error: "Unauthorized" };

    try {
        const deal = await OpportunityService.get(id);
        return { data: deal };
    } catch (e) {
        console.error("Failed to fetch Deal", e);
        return { data: null, error: "Failed to fetch Deal" };
    }
}

/**
 * Creates a new Deal (Opportunity).
 */
export async function createOpportunity(data: OpportunityData) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    try {
        const result = await OpportunityService.create(data);
        revalidatePath("/handson/all/crm/deals");
        return { success: true, message: result };
    } catch (e: any) {
        return { success: false, error: e?.message || "Error creating deal" };
    }
}

/**
 * Updates an existing Deal (Opportunity).
 */
export async function updateOpportunity(name: string, data: Partial<OpportunityData>) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    try {
        const result = await OpportunityService.update(name, data);
        revalidatePath("/handson/all/crm/deals");
        return { success: true, message: result };
    } catch (e: any) {
        return { success: false, error: e?.message || "Error updating deal" };
    }
}

/**
 * Deletes a Deal (Opportunity).
 */
export async function deleteOpportunity(name: string) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    try {
        await OpportunityService.delete(name);
        revalidatePath("/handson/all/crm/deals");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e?.message || "Error deleting deal" };
    }
}
