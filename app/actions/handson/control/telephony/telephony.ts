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
