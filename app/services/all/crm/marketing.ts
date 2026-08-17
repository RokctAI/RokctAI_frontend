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

import { BaseService } from "@/app/services/common/base";

export class MarketingService {
  // --- CAMPAIGNS ---
  static async getEmailCampaigns(page = 1, limit = 20) {
    const start = (page - 1) * limit;
    return BaseService.getList("Email Campaign", {
      fields: [
        "name",
        "campaign_name",
        "start_date",
        "status",
        "email_campaign_for",
        "recipient",
      ],
      limit_start: start,
      limit_page_length: limit,
      order_by: "creation desc",
    });
  }

  static async createEmailCampaign(data: any) {
    return BaseService.insert({ doctype: "Email Campaign", ...data });
  }

  // --- PROSPECTS ---
  static async getProspects(page = 1, limit = 20) {
    const start = (page - 1) * limit;
    return BaseService.getList("Prospect", {
      fields: [
        "name",
        "company_name",
        "industry",
        "customer_group",
        "territory",
      ],
      limit_start: start,
      limit_page_length: limit,
      order_by: "creation desc",
    });
  }

  static async getProspect(id: string) {
    return BaseService.getDoc("Prospect", id);
  }

  static async createProspect(data: any) {
    return BaseService.insert({ doctype: "Prospect", ...data });
  }

  static async updateProspect(name: string, data: any) {
    return BaseService.setValue("Prospect", name, data);
  }

  static async deleteProspect(name: string) {
    return BaseService.delete("Prospect", name);
  }
}
