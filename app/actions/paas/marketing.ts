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
