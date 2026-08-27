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

import { getClient } from "@/app/lib/client";
import { revalidatePath } from "next/cache";

export async function getCompanyDetails() {
  const frappe = await getClient();
  try {
    // Fetch the default company for the current user/session
    // Usually, in Frappe/ERPNext, 'Global Defaults' or just fetching the first Company doc works if single company.
    // For multi-company, we might need a specific logic, but assuming single tenant company context for now.
    const companies = await (frappe.db() as any).get_list("Company", {
      fields: [
        "name",
        "company_name",
        "default_currency",
        "country",
        "tax_id",
        "domain",
        "email",
      ],
      limit: 1,
    });

    if (companies && companies.length > 0) {
      return (frappe.db() as any).get_doc("Company", companies[0].name);
    }
    return null;
  } catch (e) {
    console.error("Failed to fetch Tenant Company", e);
    return null;
  }
}

export async function updateCompanyDetails(name: string, data: any) {
  const frappe = await getClient();
  try {
    const doc = await (frappe.db() as any).update_doc("Company", name, data);
    revalidatePath("/handson/all/settings/general");
    return { success: true, data: doc };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getSystemSettings() {
  const frappe = await getClient();
  try {
    return await (frappe.db() as any).get_doc("System Settings");
  } catch (e) {
    return null;
  }
}

export async function updateSystemSettings(data: any) {
  const frappe = await getClient();
  try {
    const doc = await (frappe.db() as any).update_doc(
      "System Settings",
      "System Settings",
      data,
    );
    revalidatePath("/handson/all/settings/general");
    return { success: true, data: doc };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateNamingSeries(series: string, current: number) {
  const frappe = await getClient();
  try {
    // This is usually done via a special method or directly updating the Series table if accessible.
    // Assuming we can update the 'Series' table directly or using a custom endpoint.
    // As a fallback, we'll try to update the 'Naming Series' doc if that's what was intended.
    // But often this is just updating the 'current' value for a prefix.
    await (frappe.db() as any).update_doc("Series", series, {
      current: current,
    });
    return { success: true };
  } catch (e: any) {
    // Fallback to updating 'Naming Series' doctype if it's about configuration
    try {
      await (frappe.db() as any).update_doc("Naming Series", "Naming Series", {
        [series]: current,
      });
      return { success: true };
    } catch (ex: any) {
      return { success: false, error: e.message };
    }
  }
}
