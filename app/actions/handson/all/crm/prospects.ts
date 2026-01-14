"use server";

import { MarketingService } from "@/app/services/all/crm/marketing";
import { verifyCrmRole } from "@/app/lib/roles";
import { revalidatePath } from "next/cache";

export interface ProspectData {
    company_name: string;
    industry?: string;
    market_segment?: string;
    customer_group?: string;
    territory?: string;
    no_of_employees?: string;
    annual_revenue?: number;
    website?: string;
}

/**
 * Fetches Prospects with pagination.
 */
export async function getProspects(page = 1, limit = 20) {
    if (!await verifyCrmRole()) return { data: [], total: 0 };

    try {
        const result = await MarketingService.getProspects(page, limit);
        return {
            data: result.data,
            total: result.total || 0,
            page: page,
            limit: limit
        };
    } catch (e) {
        console.error("Failed to fetch Prospects", e);
        return { data: [], total: 0 };
    }
}

/**
 * Fetches specific Prospect by ID.
 */
export async function getProspect(id: string) {
    if (!await verifyCrmRole()) return { data: null, error: "Unauthorized" };
    try {
        const result = await MarketingService.getProspect(id);
        return { data: result };
    } catch (e) {
        return { data: null, error: "Failed to fetch Prospect" };
    }
}

/**
 * Creates a new Prospect.
 */
export async function createProspect(data: ProspectData) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    try {
        const response = await MarketingService.createProspect(data);
        revalidatePath("/handson/all/crm/prospects");
        return { success: true, message: response };
    } catch (e: any) {
        return { success: false, error: e?.message || "Error creating prospect" };
    }
}

/**
 * Updates a Prospect.
 */
export async function updateProspect(name: string, data: Partial<ProspectData>) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    try {
        const response = await MarketingService.updateProspect(name, data);
        revalidatePath("/handson/all/crm/prospects");
        return { success: true, message: response };
    } catch (e: any) {
        return { success: false, error: e?.message || "Error updating prospect" };
    }
}

/**
 * Deletes a Prospect.
 */
export async function deleteProspect(name: string) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    try {
        await MarketingService.deleteProspect(name);
        revalidatePath("/handson/all/crm/prospects");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e?.message || "Error deleting prospect" };
    }
}
