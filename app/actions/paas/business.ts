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
    const ads = await paasCall(
      "api.seller_marketing.get_seller_shop_ads_packages",
    );
    return ads;
  } catch (error) {
    console.error("Failed to fetch purchased ads:", error);
    return [];
  }
}

export async function purchaseAdsPackage(packageName: string) {
  try {
    const result = await paasCall(
      "api.seller_marketing.purchase_shop_ads_package",
      {
        package_name: packageName,
      },
    );
    return result;
  } catch (error) {
    console.error("Failed to purchase ads package:", error);
    throw error;
  }
}
