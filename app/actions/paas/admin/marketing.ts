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

import { paasCall } from "@/app/lib/paas-gateway";
import { revalidatePath } from "next/cache";

import { getPaaSClient } from "@/app/lib/client";

export async function getAds(page: number = 1, limit: number = 20) {
  try {
    // api.banner.get_ads paginates by page number with a fixed server-side
    // page size of 10; the limit parameter is not supported by the backend.
    return await paasCall("api.banner.get_ads", { page });
  } catch (error) {
    console.error("Failed to fetch ads:", error);
    return [];
  }
}

export async function getShopAdsPackages(page: number = 1, limit: number = 20) {
  try {
    // api.ads_package.get_ads_packages takes no arguments and returns all
    // active packages; pagination params are accepted here for signature
    // compatibility but not forwarded.
    return await paasCall("api.ads_package.get_ads_packages");
  } catch (error) {
    console.error("Failed to fetch shop ads packages:", error);
    return [];
  }
}

export async function getCashbackRules(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_data.get_all_cashback_rules", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch cashback rules:", error);
    return [];
  }
}

export async function getShopBonuses(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_reports.get_all_shop_bonuses", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch shop bonuses:", error);
    return [];
  }
}

export async function getReferrals(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_data.get_all_referrals", {
      limit_start: start,
      limit_page_length: limit,
    });
  } catch (error) {
    console.error("Failed to fetch referrals:", error);
    return [];
  }
}

export async function createReferral(data: any) {
  try {
    await paasCall("api.admin_data.create_referral", { referral_data: data });
    revalidatePath("/paas/admin/marketing/referrals");
    return { success: true };
  } catch (error) {
    console.error("Failed to create referral:", error);
    throw error;
  }
}

export async function deleteReferral(name: string) {
  try {
    await paasCall("api.admin_data.delete_referral", { referral_name: name });
    revalidatePath("/paas/admin/marketing/referrals");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete referral:", error);
    throw error;
  }
}

export async function getEmailSubscribers(
  page: number = 1,
  limit: number = 20,
) {
  const frappe = await getPaaSClient();
  const start = (page - 1) * limit;
  try {
    return await frappe.call({
      method: "frappe.client.get_list",
      args: {
        doctype: "Email Subscription",
        fields: ["name", "email", "creation"],
        limit_start: start,
        limit_page_length: limit,
        order_by: "creation desc",
      },
    });
  } catch (error) {
    console.error("Failed to fetch email subscribers:", error);
    return [];
  }
}
