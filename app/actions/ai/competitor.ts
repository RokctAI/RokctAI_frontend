"use server";

import { getClient } from "@/app/lib/client";
import { recordTokenUsage, checkTokenQuota, ACTION_TOKEN_COST } from "@/app/lib/usage";
import { auth } from "@/app/(auth)/auth";
import { AI_MODELS } from "@/ai/models";
import { verifyCrmRole } from "@/app/lib/roles";

export async function createAiCompetitor(data: { name: string; industry?: string; threat_level?: string; latitude?: number; longitude?: number; website?: string; modelId?: string }) {
    const session = await auth();
    const client = await getClient();

    const modelToCharge = data.modelId || AI_MODELS.FREE.id;

    // 1. Security Check
    if (!await verifyCrmRole()) {
        return { success: false, error: "Unauthorized: Access Restricted to CRM/Sales Managers." };
    }

    // 2. Quota Check
    const hasQuota = await checkTokenQuota(session);
    if (!hasQuota) return { success: false, error: "Quota exceeded." };

    try {
        const payload: any = {
            doctype: "Competitor",
            competitor_name: data.name,
            industry: data.industry,
            threat_level: data.threat_level,
            website: data.website
        };

        // If location provided, we might need to store it. 
        // Standard "Competitor" doctype might not have lat/long fields by default.
        // We will assume custom fields 'latitude' and 'longitude' exist or put it in 'headquarters_location' or remarks.
        if (data.latitude && data.longitude) {
            payload.latitude = data.latitude;
            payload.longitude = data.longitude;
            // Also simpler google maps link in generic field for visibility
            payload.headquarters_location = `https://maps.google.com/?q=${data.latitude},${data.longitude}`;
        }

        const response = await client.call({
            method: "frappe.client.insert",
            args: { doc: payload },
            headers: { 'X-AI-Action': 'true' }
        }) as any;

        if (response?.message) {
            if (session) recordTokenUsage(session, ACTION_TOKEN_COST, modelToCharge);
            return { success: true, message: `Competitor '${data.name}' added successfully.` };
        }
        return { success: false, error: "No response from backend." };

    } catch (e: any) {
        return { success: false, error: e?.message || "Unknown error" };
    }
}

export async function getAiCompetitors(data: { modelId?: string } = {}) {
    const session = await auth();
    const client = await getClient();

    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };

    try {
        const competitors = await client.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Competitor",
                fields: ["name", "competitor_name", "industry", "threat_level", "headquarters_location"],
                order_by: "creation desc",
                limit_page_length: 10
            }
        }) as any;

        return { success: true, competitors: competitors?.message || [] };
    } catch (e: any) {
        return { success: false, error: e?.message };
    }
}

export async function analyzeAiCompetitor(data: { name: string; modelId?: string }) {
    const session = await auth();
    const client = await getClient();

    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };

    try {
        // Fetch Details + Child Tables?
        // Basic fetch for now
        const competitor = await client.call({
            method: "frappe.client.get",
            args: {
                doctype: "Competitor",
                name: data.name
            }
        }) as any;

        return { success: true, competitor: competitor?.message };
    } catch (e: any) {
        return { success: false, error: e?.message };
    }
}
