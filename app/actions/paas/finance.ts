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

// Wallet

export async function getWallet() {
  try {
    const wallet = await paasCall("api.user.get_user_wallet");
    return wallet;
  } catch (error) {
    console.error("Failed to fetch wallet:", error);
    return null;
  }
}

export async function getWalletHistory() {
  try {
    const history = await paasCall("api.user.get_wallet_history");
    return history;
  } catch (error) {
    console.error("Failed to fetch wallet history:", error);
    return [];
  }
}

export async function topUpWallet(amount: number) {
  try {
    const result = await paasCall("api.payment.process_wallet_top_up", {
      amount: amount,
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
    const payouts = await paasCall("api.seller_payout.get_seller_payouts");
    return payouts;
  } catch (error) {
    console.error("Failed to fetch payouts:", error);
    return [];
  }
}
