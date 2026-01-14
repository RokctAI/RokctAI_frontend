"use server";

import { getPaaSClient } from "@/app/lib/client";

// Subscriptions

export async function getSubscriptions() {
    const frappe = await getPaaSClient();

    try {
        const subscriptions = await frappe.call({
            method: "paas.api.subscription.subscription.list_subscriptions",
        });
        return subscriptions;
    } catch (error) {
        console.error("Failed to fetch subscriptions:", error);
        return [];
    }
}

export async function getMyShopSubscription() {
    const frappe = await getPaaSClient();

    try {
        const subs = await frappe.call({
            method: "paas.api.subscription.subscription.get_my_shop_subscription",
        });
        return subs.length > 0 ? subs[0] : null;
    } catch (error) {
        console.error("Failed to fetch my shop subscription:", error);
        return null;
    }
}

export async function subscribeMyShop(subscriptionId: string) {
    const frappe = await getPaaSClient();

    try {
        const result = await frappe.call({
            method: "paas.api.subscription.subscription.subscribe_my_shop",
            args: {
                subscription_id: subscriptionId
            }
        });
        return result;
    } catch (error) {
        console.error("Failed to subscribe shop:", error);
        throw error;
    }
}

// Ads

export async function getAdsPackages() {
    const frappe = await getPaaSClient();

    try {
        const packages = await frappe.call({
            method: "paas.api.seller_marketing.seller_marketing.get_ads_packages",
        });
        return packages;
    } catch (error) {
        console.error("Failed to fetch ads packages:", error);
        return [];
    }
}

export async function getPurchasedAds() {
    const frappe = await getPaaSClient();

    try {
        const ads = await frappe.call({
            method: "paas.api.seller_marketing.seller_marketing.get_seller_shop_ads_packages",
        });
        return ads;
    } catch (error) {
        console.error("Failed to fetch purchased ads:", error);
        return [];
    }
}

export async function purchaseAdsPackage(packageName: string) {
    const frappe = await getPaaSClient();

    try {
        const result = await frappe.call({
            method: "paas.api.seller_marketing.seller_marketing.purchase_shop_ads_package",
            args: {
                package_name: packageName
            }
        });
        return result;
    } catch (error) {
        console.error("Failed to purchase ads package:", error);
        throw error;
    }
}
