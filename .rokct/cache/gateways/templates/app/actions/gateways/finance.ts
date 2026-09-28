/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

"use server";

import { paasCall } from "@/app/services/base/platform-gateway";

// Wallet

export async function getWallet() {
  try {
    // get_user_wallet returns api_response(data=<Wallet doc>).
    const res = await paasCall<any>("api.user.get_user_wallet");
    return res?.data ?? null;
  } catch (error) {
    console.error("Failed to fetch wallet:", error);
    return null;
  }
}

export async function getWalletHistory() {
  try {
    // get_wallet_history returns api_response(data=[...Wallet History rows]).
    const res = await paasCall<any>("api.user.get_wallet_history");
    return Array.isArray(res?.data) ? res.data : [];
  } catch (error) {
    console.error("Failed to fetch wallet history:", error);
    return [];
  }
}

export async function getSavedCards() {
  try {
    // get_saved_cards returns a bare list of Saved Card rows.
    const cards = await paasCall<any>("api.payment.get_saved_cards");
    return Array.isArray(cards) ? cards : [];
  } catch (error) {
    console.error("Failed to fetch saved cards:", error);
    return [];
  }
}

export async function topUpWallet(amount: number, savedCard: string) {
  try {
    // process_wallet_top_up charges a Saved Card by its docname.
    const result = await paasCall("api.payment.process_wallet_top_up", {
      amount: amount,
      saved_card: savedCard,
    });
    return result;
  } catch (error) {
    console.error("Failed to top up wallet:", error);
    throw error;
  }
}

// Transactions

export async function getTransactions() {
  try {
    const transactions = await paasCall(
      "api.seller_transactions.get_seller_transactions",
    );
    return transactions;
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return [];
  }
}

export async function getShopPayments() {
  try {
    const payments = await paasCall(
      "api.seller_transactions.get_seller_shop_payments",
    );
    return payments;
  } catch (error) {
    console.error("Failed to fetch shop payments:", error);
    return [];
  }
}

export async function getPartnerPayments() {
  try {
    const payments = await paasCall(
      "api.seller_transactions.get_seller_payment_to_partners",
    );
    return payments;
  } catch (error) {
    console.error("Failed to fetch partner payments:", error);
    return [];
  }
}

// Payouts

export async function getPayouts() {
  try {
    // There is no Seller Payout doctype: a seller's payouts are their own
    // Wallet Payout Requests. Shaped for the payouts table.
    const requests = await paasCall("api.payout.list_payout_requests");
    return (Array.isArray(requests) ? requests : []).map((r: any) => ({
      name: r.id,
      amount: r.amount,
      status: r.status,
      payout_date: r.resolved_at ?? r.requested_at,
    }));
  } catch (error) {
    console.error("Failed to fetch payouts:", error);
    return [];
  }
}
