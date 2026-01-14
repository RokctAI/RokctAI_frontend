"use server";

import { revalidatePath } from "next/cache";
import { getPaaSClient } from "@/app/lib/client";

// Coupons

export async function getCoupons() {
    const frappe = await getPaaSClient();

    try {
        const coupons = await frappe.call({
            method: "paas.api.seller_marketing.seller_marketing.get_seller_coupons",
        });
        return coupons;
    } catch (error) {
        console.error("Failed to fetch coupons:", error);
        return [];
    }
}

export async function createCoupon(data: any) {
    const frappe = await getPaaSClient();

    try {
        const coupon = await frappe.call({
            method: "paas.api.seller_marketing.seller_marketing.create_seller_coupon",
            args: {
                coupon_data: data
            }
        });
        revalidatePath("/paas/dashboard/marketing/coupons");
        return coupon;
    } catch (error) {
        console.error("Failed to create coupon:", error);
        throw error;
    }
}

export async function updateCoupon(name: string, data: any) {
    const frappe = await getPaaSClient();

    try {
        const coupon = await frappe.call({
            method: "paas.api.seller_marketing.seller_marketing.update_seller_coupon",
            args: {
                coupon_name: name,
                coupon_data: data
            }
        });
        revalidatePath("/paas/dashboard/marketing/coupons");
        return coupon;
    } catch (error) {
        console.error("Failed to update coupon:", error);
        throw error;
    }
}

export async function deleteCoupon(name: string) {
    const frappe = await getPaaSClient();

    try {
        await frappe.call({
            method: "paas.api.seller_marketing.seller_marketing.delete_seller_coupon",
            args: {
                coupon_name: name
            }
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
    const frappe = await getPaaSClient();

    try {
        const bonuses = await frappe.call({
            method: "paas.api.seller_bonus.seller_bonus.get_seller_bonuses",
        });
        return bonuses;
    } catch (error) {
        console.error("Failed to fetch bonuses:", error);
        return [];
    }
}
