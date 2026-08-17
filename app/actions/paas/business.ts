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

"use server";

import { paasCall } from "@/app/lib/paas-gateway";

// Subscriptions

export async function getSubscriptions() {
  try {
    const subscriptions = await paasCall("api.subscription.list_subscriptions");
    return subscriptions;
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error);
    return [];
  }
}

export async function getMyShopSubscription() {
  try {
    const subs = await paasCall("api.subscription.get_my_shop_subscription");
    return subs.length > 0 ? subs[0] : null;
  } catch (error) {
    console.error("Failed to fetch my shop subscription:", error);
    return null;
  }
}

export async function subscribeMyShop(subscriptionId: string) {
  try {
    const result = await paasCall("api.subscription.subscribe_my_shop", {
        subscription_id: subscriptionId,
      });
    return result;
  } catch (error) {
    console.error("Failed to subscribe shop:", error);
    throw error;
  }
}

// Ads

export async function getAdsPackages() {
  try {
    const packages = await paasCall("api.seller_marketing.get_ads_packages");
    return packages;
  } catch (error) {
    console.error("Failed to fetch ads packages:", error);
    return [];
  }
}

export async function getPurchasedAds() {
  try {
    const ads = await paasCall("api.seller_marketing.get_seller_shop_ads_packages");
    return ads;
  } catch (error) {
    console.error("Failed to fetch purchased ads:", error);
    return [];
  }
}

export async function purchaseAdsPackage(packageName: string) {
  try {
    const result = await paasCall("api.seller_marketing.purchase_shop_ads_package", {
        package_name: packageName,
      });
    return result;
  } catch (error) {
    console.error("Failed to purchase ads package:", error);
    throw error;
  }
}
