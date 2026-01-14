"use server";

import { revalidatePath } from "next/cache";

import { getPaaSClient } from "@/app/lib/client";

export async function getTransactions(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_finance.admin_finance.get_all_transactions",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch transactions:", error);
        return [];
    }
}

export async function getPayoutRequests(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_finance.admin_finance.get_payout_requests",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch payout requests:", error);
        return [];
    }
}

export async function getPayouts(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_finance.admin_finance.get_all_payouts",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch payouts:", error);
        return [];
    }
}

export async function getShopSubscriptions(page: number = 1, limit: number = 20) {
    const frappe = await getPaaSClient();
    const start = (page - 1) * limit;
    try {
        return await frappe.call({
            method: "paas.api.admin_finance.admin_finance.get_shop_subscriptions",
            args: { limit_start: start, limit_page_length: limit }
        });
    } catch (error) {
        console.error("Failed to fetch shop subscriptions:", error);
        return [];
    }
}

export async function updatePayoutRequest(name: string, status: string) {
    const frappe = await getPaaSClient();
    try {
        await frappe.call({
            method: "paas.api.admin_finance.admin_finance.update_payout_request",
            args: { request_name: name, status: status }
        });
        revalidatePath("/paas/admin/finance/payouts/requests");
        return { success: true };
    } catch (error) {
        console.error("Failed to update payout request:", error);
        throw error;
    }
}
