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
