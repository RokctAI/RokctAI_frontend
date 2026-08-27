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
import { getCurrentSession } from "@/app/(auth)/actions"; // Keeping this as it's used for user email

export async function createPOSOrder(orderData: any) {
  const session = await getCurrentSession();
  if (!session || !session.user) {
    throw new Error("User not authenticated");
  }

  try {
    // 1. Get User's Shop
    const shop = await paasCall("api.user.get_user_shop");

    if (!shop) {
      throw new Error("Shop not found for user");
    }

    // 2. Prepare Order Data
    const finalOrderData = {
      ...orderData,
      shop: shop.name,
      user: (session.user as any).email, // Or a generic "Walk-in" user if supported
      status: "Accepted", // POS orders are immediate
      delivery_type: "Pickup",
      payment_status: "Paid", // Assuming POS collects payment immediately
      creation: new Date().toISOString(),
    };

    // 3. Create Order
    const order = await paasCall("api.order.create_order", {
      order_data: finalOrderData,
    });

    revalidatePath("/paas/dashboard/orders");
    return order;
  } catch (error) {
    console.error("Failed to create POS order:", error);
    throw error;
  }
}
