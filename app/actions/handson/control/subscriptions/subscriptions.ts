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

import { SubscriptionService } from "@/app/services/control/subscriptions";

export async function getCompanySubscriptions() {
  return SubscriptionService.getCompanySubscriptions();
}

export async function getSubscriptionPlans() {
  return SubscriptionService.getSubscriptionPlans();
}

export async function getSubscriptionPlan(name: string) {
  return SubscriptionService.getSubscriptionPlan(name);
}

export async function getModuleDefs() {
  return SubscriptionService.getModuleDefs();
}

export async function getSubscriptionSettings() {
  return SubscriptionService.getSubscriptionSettings();
}

export async function createCompanySubscription(data: any) {
  return SubscriptionService.createCompanySubscription(data);
}

export async function updateCompanySubscription(name: string, data: any) {
  return SubscriptionService.updateCompanySubscription(name, data);
}

export async function deleteCompanySubscription(name: string) {
  await SubscriptionService.deleteCompanySubscription(name);
}

export async function createSubscriptionPlan(data: any) {
  return SubscriptionService.createSubscriptionPlan(data);
}

export async function updateSubscriptionPlan(name: string, data: any) {
  return SubscriptionService.updateSubscriptionPlan(name, data);
}

export async function deleteSubscriptionPlan(name: string) {
  await SubscriptionService.deleteSubscriptionPlan(name);
}

export async function updateSubscriptionSettings(name: string, data: any) {
  return SubscriptionService.updateSubscriptionSettings(name, data);
}

export async function getCustomers() {
  try {
    const response = await SubscriptionService.getCustomers();
    return response?.message || [];
  } catch (e) {
    console.error("Failed to fetch Customers", e);
    return [];
  }
}

export async function loginAsTenant(companyName: string) {
  // Check if company exists using Service
  const company = await SubscriptionService.getCompany(companyName);
  if (!company) throw new Error("Company not found");

  // Return the "Magic Link"
  return {
    url: `/handson/tenant?company_context=${encodeURIComponent(companyName)}&admin_session=true`,
    success: true,
  };
}
