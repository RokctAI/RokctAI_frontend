"use server";

import { paasCall } from "@/app/lib/paas-gateway";
import { revalidatePath } from "next/cache";


export async function getWallets(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_finance.get_all_wallets", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch wallets:", error);
    return [];
  }
}

export async function getSellerPayments(
  status: string = "Pending",
  page: number = 1,
  limit: number = 20,
) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_finance.get_seller_payments", { status, limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch seller payments:", error);
    return [];
  }
}

export async function getDeliverymanPayments(
  status: string = "Pending",
  page: number = 1,
  limit: number = 20,
) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_finance.get_deliveryman_payments", { status, limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch deliveryman payments:", error);
    return [];
  }
}

export async function getSubscribers(page: number = 1, limit: number = 20) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_settings.get_email_subscriptions", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch subscribers:", error);
    return [];
  }
}

export async function getSubscriberMessages(
  page: number = 1,
  limit: number = 20,
) {
  const start = (page - 1) * limit;
  try {
    return await paasCall("api.admin_management.get_subscriber_messages", { limit_start: start, limit_page_length: limit });
  } catch (error) {
    console.error("Failed to fetch subscriber messages:", error);
    return [];
  }
}
