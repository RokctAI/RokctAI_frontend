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

import { FinanceService } from "@/app/services/control/finance";
import { revalidatePath } from "next/cache";

export async function getCustomerWallets() {
  return FinanceService.getCustomerWallets();
}

export async function getWalletLedgers() {
  return FinanceService.getWalletLedgers();
}

export async function getTenantPayoutRequests() {
  return FinanceService.getTenantPayoutRequests();
}

// CRUD Actions

export async function createCustomerWallet(data: any) {
  const doc = await FinanceService.createCustomerWallet(data);
  revalidatePath("/handson/control/finance");
  return doc;
}

export async function updateCustomerWallet(name: string, data: any) {
  const doc = await FinanceService.updateCustomerWallet(name, data);
  revalidatePath("/handson/control/finance");
  return doc;
}

export async function deleteCustomerWallet(name: string) {
  await FinanceService.deleteCustomerWallet(name);
  revalidatePath("/handson/control/finance");
}

export async function createWalletLedger(data: any) {
  const doc = await FinanceService.createWalletLedger(data);
  revalidatePath("/handson/control/finance");
  return doc;
}

export async function updateWalletLedger(name: string, data: any) {
  const doc = await FinanceService.updateWalletLedger(name, data);
  revalidatePath("/handson/control/finance");
  return doc;
}

export async function deleteWalletLedger(name: string) {
  await FinanceService.deleteWalletLedger(name);
  revalidatePath("/handson/control/finance");
}

export async function createTenantPayoutRequest(data: any) {
  const doc = await FinanceService.createTenantPayoutRequest(data);
  revalidatePath("/handson/control/finance");
  return doc;
}

export async function updateTenantPayoutRequest(name: string, data: any) {
  const doc = await FinanceService.updateTenantPayoutRequest(name, data);
  revalidatePath("/handson/control/finance");
  return doc;
}

export async function deleteTenantPayoutRequest(name: string) {
  await FinanceService.deleteTenantPayoutRequest(name);
  revalidatePath("/handson/control/finance");
}
