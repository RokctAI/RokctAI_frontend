"use server";

import { getPaaSClient } from "@/app/lib/client";

// Wallet

export async function getWallet() {
    const frappe = await getPaaSClient();

    try {
        const wallet = await frappe.call({
            method: "paas.api.user.user.get_user_wallet",
        });
        return wallet;
    } catch (error) {
        console.error("Failed to fetch wallet:", error);
        return null;
    }
}

export async function getWalletHistory() {
    const frappe = await getPaaSClient();

    try {
        const history = await frappe.call({
            method: "paas.api.user.user.get_wallet_history",
        });
        return history;
    } catch (error) {
        console.error("Failed to fetch wallet history:", error);
        return [];
    }
}

export async function topUpWallet(amount: number) {
    const frappe = await getPaaSClient();

    try {
        const result = await frappe.call({
            method: "paas.api.payment.payment.process_wallet_top_up",
            args: {
                amount: amount
            }
        });
        return result;
    } catch (error) {
        console.error("Failed to top up wallet:", error);
        throw error;
    }
}

// Transactions

export async function getTransactions() {
    const frappe = await getPaaSClient();

    try {
        const transactions = await frappe.call({
            method: "paas.api.seller_transactions.seller_transactions.get_seller_transactions",
        });
        return transactions;
    } catch (error) {
        console.error("Failed to fetch transactions:", error);
        return [];
    }
}

export async function getShopPayments() {
    const frappe = await getPaaSClient();

    try {
        const payments = await frappe.call({
            method: "paas.api.seller_transactions.seller_transactions.get_seller_shop_payments",
        });
        return payments;
    } catch (error) {
        console.error("Failed to fetch shop payments:", error);
        return [];
    }
}

export async function getPartnerPayments() {
    const frappe = await getPaaSClient();

    try {
        const payments = await frappe.call({
            method: "paas.api.seller_transactions.seller_transactions.get_seller_payment_to_partners",
        });
        return payments;
    } catch (error) {
        console.error("Failed to fetch partner payments:", error);
        return [];
    }
}

// Payouts

export async function getPayouts() {
    const frappe = await getPaaSClient();

    try {
        const payouts = await frappe.call({
            method: "paas.api.seller_payout.seller_payout.get_seller_payouts",
        });
        return payouts;
    } catch (error) {
        console.error("Failed to fetch payouts:", error);
        return [];
    }
}
