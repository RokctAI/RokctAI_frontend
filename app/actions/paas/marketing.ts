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

import { paasCall } from "@/app/lib/paas-gateway";
import { revalidatePath } from "next/cache";

// Coupons

export async function getCoupons() {
  try {
    const coupons = await paasCall("api.seller_marketing.get_seller_coupons");
    return coupons;
  } catch (error) {
    console.error("Failed to fetch coupons:", error);
    return [];
  }
}

export async function createCoupon(data: any) {
  try {
    const coupon = await paasCall("api.seller_marketing.create_seller_coupon", {
      coupon_data: data,
    });
    revalidatePath("/paas/dashboard/marketing/coupons");
    return coupon;
  } catch (error) {
    console.error("Failed to create coupon:", error);
    throw error;
  }
}

export async function updateCoupon(name: string, data: any) {
  try {
    const coupon = await paasCall("api.seller_marketing.update_seller_coupon", {
      coupon_name: name,
      coupon_data: data,
    });
    revalidatePath("/paas/dashboard/marketing/coupons");
    return coupon;
  } catch (error) {
    console.error("Failed to update coupon:", error);
    throw error;
  }
}

export async function deleteCoupon(name: string) {
  try {
    await paasCall("api.seller_marketing.delete_seller_coupon", {
      coupon_name: name,
    });
    revalidatePath("/paas/dashboard/marketing/coupons");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete coupon:", error);
    throw error;
  }
}

// Bonuses

export async function getBonuses() {
  try {
    const bonuses = await paasCall("api.seller_bonus.get_seller_bonuses");
    return bonuses;
  } catch (error) {
    console.error("Failed to fetch bonuses:", error);
    return [];
  }
}
