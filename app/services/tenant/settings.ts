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

import { TenantBaseService } from "./base";

export class SettingsService {
  static async getTenantEmailSettings() {
    return TenantBaseService.getDoc(
      "Tenant Email Settings",
      "Tenant Email Settings",
    );
  }

  static async updateTenantEmailSettings(data: any) {
    return TenantBaseService.update(
      "Tenant Email Settings",
      "Tenant Email Settings",
      data,
    );
  }

  static async getSynapticSettings() {
    return TenantBaseService.getDoc(
      "Synaptic Convergence Settings",
      "Synaptic Convergence Settings",
    );
  }

  static async updateSynapticSettings(data: any) {
    return TenantBaseService.update(
      "Synaptic Convergence Settings",
      "Synaptic Convergence Settings",
      data,
    );
  }

  static async getStimulusCategories() {
    return TenantBaseService.getList("Stimulus Category", {
      fields: ["name", "category_name"],
      order_by: "category_name asc",
    });
  }

  static async getCompanySettings() {
    const companies = await TenantBaseService.getList("Company", {
      fields: [
        "name",
        "company_name",
        "company_logo",
        "print_logo",
        "default_print_format",
        "tax_id",
        "credit_provider_license",
        "country",
        "default_currency",
      ],
      limit_page_length: 1,
    });
    return companies?.[0] || null;
  }

  static async updateCompanySettings(data: any) {
    // We need the company name to update. Assuming single company for now or passed in data?
    // Typically we'd pass the name. But if we fetch the default one, we can update it.
    // Let's assume the name is passed in 'data' or we fetch it first.
    // For efficiency, let's require 'name' in data or fetch if missing.
    let name = data.name;
    if (!name) {
      const c = await this.getCompanySettings();
      if (c) name = c.name;
    }
    if (!name) throw new Error("Company not found");

    return TenantBaseService.update("Company", name, data);
  }
}
