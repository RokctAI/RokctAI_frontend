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
