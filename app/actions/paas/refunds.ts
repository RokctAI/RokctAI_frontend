"use server";

import { revalidatePath } from "next/cache";
import { getPaaSClient } from "@/app/lib/client";

export async function getRefunds() {
    const frappe = await getPaaSClient();

    try {
        const refunds = await frappe.call({
            method: "paas.api.seller_order.seller_order.get_seller_order_refunds"
        });
        return refunds;
    } catch (error) {
        console.error("Failed to fetch refunds:", error);
        return [];
    }
}

export async function updateRefund(refundId: string, status: string, answer?: string) {
    const frappe = await getPaaSClient();

    try {
        const refund = await frappe.call({
            method: "paas.api.seller_order.seller_order.update_seller_order_refund",
            args: {
                refund_name: refundId,
                status: status,
                answer: answer
            }
        });
        revalidatePath("/paas/dashboard/orders/refunds");
        return refund;
    } catch (error) {
        console.error("Failed to update refund:", error);
        throw error;
    }
}

export async function getReviews() {
    const frappe = await getPaaSClient();

    try {
        const reviews = await frappe.call({
            method: "paas.api.seller_order.seller_order.get_seller_reviews"
        });
        return reviews;
    } catch (error) {
        console.error("Failed to fetch reviews:", error);
        return [];
    }
}
