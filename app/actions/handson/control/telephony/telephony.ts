"use server";

import { TelephonyService } from "@/app/services/control/telephony";
import { revalidatePath } from "next/cache";

export async function getTelephonySettings() {
    return TelephonyService.getTelephonySettings();
}

export async function getTelephonyCustomers() {
    return TelephonyService.getTelephonyCustomers();
}

export async function getTelephonySubscriptions() {
    return TelephonyService.getTelephonySubscriptions();
}

export async function getTelephonyTransactions() {
    return TelephonyService.getTelephonyTransactions();
}

export async function getAvailableDIDs() {
    return TelephonyService.getAvailableDIDs();
}

// CRUD Actions

export async function updateTelephonySettings(name: string, data: any) {
    const doc = await TelephonyService.updateTelephonySettings(name, data);
    revalidatePath("/handson/control/telephony");
    return doc;
}

export async function createTelephonyCustomer(data: any) {
    const doc = await TelephonyService.createTelephonyCustomer(data);
    revalidatePath("/handson/control/telephony");
    return doc;
}

export async function updateTelephonyCustomer(name: string, data: any) {
    const doc = await TelephonyService.updateTelephonyCustomer(name, data);
    revalidatePath("/handson/control/telephony");
    return doc;
}

export async function deleteTelephonyCustomer(name: string) {
    await TelephonyService.deleteTelephonyCustomer(name);
    revalidatePath("/handson/control/telephony");
}

export async function createTelephonySubscription(data: any) {
    const doc = await TelephonyService.createTelephonySubscription(data);
    revalidatePath("/handson/control/telephony");
    return doc;
}

export async function updateTelephonySubscription(name: string, data: any) {
    const doc = await TelephonyService.updateTelephonySubscription(name, data);
    revalidatePath("/handson/control/telephony");
    return doc;
}

export async function deleteTelephonySubscription(name: string) {
    await TelephonyService.deleteTelephonySubscription(name);
    revalidatePath("/handson/control/telephony");
}

export async function createAvailableDID(data: any) {
    const doc = await TelephonyService.createAvailableDID(data);
    revalidatePath("/handson/control/telephony");
    return doc;
}

export async function updateAvailableDID(name: string, data: any) {
    const doc = await TelephonyService.updateAvailableDID(name, data);
    revalidatePath("/handson/control/telephony");
    return doc;
}

export async function deleteAvailableDID(name: string) {
    await TelephonyService.deleteAvailableDID(name);
    revalidatePath("/handson/control/telephony");
}
