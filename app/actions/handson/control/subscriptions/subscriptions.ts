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
