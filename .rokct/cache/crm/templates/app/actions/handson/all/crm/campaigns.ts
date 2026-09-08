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
  if (!(await verifyCrmRole())) return { data: [], total: 0 };

  try {
    const result = await MarketingService.getEmailCampaigns(page, limit);
    return {
      data: result.data,
      total: result.total || 0,
      page: page,
      limit: limit,
    };
  } catch (e) {
    console.error("Failed to fetch Email Campaigns", e);
    return { data: [], total: 0 };
  }
}

export async function createEmailCampaign(data: EmailCampaignData) {
  if (!(await verifyCrmRole()))
    return { success: false, error: "Unauthorized" };
  try {
    const response = await MarketingService.createEmailCampaign(data);
    revalidatePath("/handson/all/crm/campaigns");
    return { success: true, message: response };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error creating campaign" };
  }
}
