"use server";

import { verifyCrmRole } from "@/app/lib/roles";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LeadService } from "@/app/services/all/crm/leads";

import { LeadSchema, LeadData } from "./types";

/**
 * Fetches Leads with pagination.
 * @param page - Page number (default 1)
 * @param limit - Items per page (default 20)
 */
export async function getLeads(page = 1, limit = 20) {
    if (!await verifyCrmRole()) return { data: [], total: 0 };

    try {
        return await LeadService.getList(page, limit);
    } catch (e) {
        console.error("Failed to fetch Leads", e);
        return { data: [], total: 0 };
    }
}

/**
 * Fetches a single Lead by ID.
 * @param id - Lead ID (name)
 */
export async function getLead(id: string) {
    if (!await verifyCrmRole()) return { data: null, error: "Unauthorized" };

    try {
        const lead = await LeadService.get(id);
        return { data: lead };
    } catch (e) {
        console.error("Failed to fetch Lead", e);
        return { data: null, error: "Failed to fetch Lead" };
    }
}

export async function createLead(data: LeadData) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };

    const validation = LeadSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    try {
        const result = await LeadService.create(data);
        revalidatePath("/handson/all/crm/leads");
        return { success: true, message: "Lead created successfully", data: result };
    } catch (e: any) {
        console.error("Create Lead Error", e);
        return { success: false, error: e?.message || "Error creating lead" };
    }
}

export async function updateLead(name: string, data: Partial<LeadData>) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };

    try {
        // We perform partial updates, Zod schema is for creation mostly but we can validate partials if strictly required.
        // For updates, we usually allow partial fields.
        const result = await LeadService.update(name, data);
        revalidatePath("/handson/all/crm/leads");
        return { success: true, message: "Lead updated successfully", data: result };
    } catch (e: any) {
        console.error("Update Lead Error", e);
        return { success: false, error: e?.message || "Error updating lead" };
    }
}

/**
 * Deletes a Lead.
 * @param name - Lead ID
 */
export async function deleteLead(name: string) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    try {
        await LeadService.delete(name);
        revalidatePath("/handson/all/crm/leads");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e?.message || "Error deleting lead" };
    }
}
