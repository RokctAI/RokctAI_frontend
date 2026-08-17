"use server";

import { paasCall } from "@/app/lib/paas-gateway";
import { revalidatePath } from "next/cache";

export async function getRefunds() {
  try {
    const refunds = await paasCall("api.seller_order.get_seller_order_refunds");
    return refunds;
  } catch (error) {
    console.error("Failed to fetch refunds:", error);
    return [];
  }
}

export async function updateRefund(
  refundId: string,
  status: string,
  answer?: string,
) {
  try {
    const refund = await paasCall("api.seller_order.update_seller_order_refund", {
        refund_name: refundId,
        status: status,
        answer: answer,
      });
    revalidatePath("/paas/dashboard/orders/refunds");
    return refund;
  } catch (error) {
    console.error("Failed to update refund:", error);
    throw error;
  }
}

export async function getReviews() {
  try {
    const reviews = await paasCall("api.seller_order.get_seller_reviews");
    return reviews;
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return [];
  }
}
