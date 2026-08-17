"use server";

import { paasCall } from "@/app/lib/paas-gateway";
import { revalidatePath } from "next/cache";

import { getPaaSClient } from "@/app/lib/client";

export async function getAds(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_content.get_all_ads", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch ads:", error);
    return [];
  }
}

export async function getShopAdsPackages(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_content.get_all_shop_ads_packages", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch shop ads packages:", error);
    return [];
  }
}

export async function getCashbackRules(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_data.get_all_cashback_rules", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch cashback rules:", error);
    return [];
  }
}

export async function getShopBonuses(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_reports.get_all_shop_bonuses", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch shop bonuses:", error);
    return [];
  }
}

export async function getReferrals(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_data.get_all_referrals", { limit_start: start, limit_page_length: limit });
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
