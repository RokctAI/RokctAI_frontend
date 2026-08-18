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
    const refund = await paasCall(
      "api.seller_order.update_seller_order_refund",
      {
        refund_name: refundId,
        status: status,
        answer: answer,
      },
    );
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
