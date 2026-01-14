"use server";

import { revalidatePath } from "next/cache";

import { getPaaSClient } from "@/app/lib/client";

export async function getWallets(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_finance.admin_finance.get_all_wallets",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch wallets:", error);
        return [];
    }
}

export async function getSellerPayments(status: string = "Pending", page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_finance.admin_finance.get_seller_payments",
            args: { status, limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch seller payments:", error);
        return [];
    }
}

export async function getDeliverymanPayments(status: string = "Pending", page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_finance.admin_finance.get_deliveryman_payments",
            args: { status, limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch deliveryman payments:", error);
        return [];
    }
}

export async function getSubscribers(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_management.admin_management.get_all_subscribers",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch subscribers:", error);
        return [];
    }
}

export async function getSubscriberMessages(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_management.admin_management.get_subscriber_messages",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch subscriber messages:", error);
        return [];
    }
}
