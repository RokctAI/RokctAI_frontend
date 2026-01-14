"use server";

import { MarketingService } from "@/app/services/all/crm/marketing";
import { verifyCrmRole } from "@/app/lib/roles";
import { revalidatePath } from "next/cache";

export interface EmailCampaignData {
    campaign_name: string;
    email_template: string;
    start_date: string;
    email_campaign_for: "Lead" | "Contact" | "Prospect";
    recipient: string;
}

export async function getEmailCampaigns(page = 1, limit = 20) {
    if (!await verifyCrmRole()) return { data: [], total: 0 };

    try {
        const result = await MarketingService.getEmailCampaigns(page, limit);
        return {
            data: result.data,
            total: result.total || 0,
            page: page,
            limit: limit
        };
    } catch (e) {
        console.error("Failed to fetch Email Campaigns", e);
        return { data: [], total: 0 };
    }
}

export async function createEmailCampaign(data: EmailCampaignData) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    try {
        const response = await MarketingService.createEmailCampaign(data);
        revalidatePath("/handson/all/crm/campaigns");
        return { success: true, message: response };
    } catch (e: any) {
        return { success: false, error: e?.message || "Error creating campaign" };
    }
}
