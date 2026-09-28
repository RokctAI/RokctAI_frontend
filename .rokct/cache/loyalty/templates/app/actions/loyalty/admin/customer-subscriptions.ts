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

import { revalidatePath } from "next/cache";

import { paasCall } from "@/app/services/base/platform-gateway";

export type CustomerSubscriptionBenefitType =
  | "Free Delivery"
  | "Delivery Discount"
  | "Service Fee Waiver"
  | "Other";

export interface CustomerSubscriptionBenefit {
  benefit_type: CustomerSubscriptionBenefitType;
  value?: number | null;
  description?: string | null;
}

export interface CustomerSubscriptionPlan {
  name?: string;
  plan_name: string;
  description?: string | null;
  price: number;
  currency?: string | null;
  period: "Monthly" | "Quarterly" | "Yearly";
  active: number | boolean;
  benefits: CustomerSubscriptionBenefit[];
}

const API = "api.admin_customer_subscription";
const PATH = "/admin/finance/customer-subscriptions";

export async function getCustomerSubscriptionPlans(
  page: number = 1,
  limit: number = 50,
): Promise<CustomerSubscriptionPlan[]> {
  try {
    const data = await paasCall(`${API}.get_customer_subscription_plans`, {
      limit_start: (page - 1) * limit,
      limit_page_length: limit,
    });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch customer subscription plans:", error);
    return [];
  }
}

export async function saveCustomerSubscriptionPlan(
  plan: CustomerSubscriptionPlan,
): Promise<CustomerSubscriptionPlan> {
  const data = JSON.stringify({ ...plan, active: plan.active ? 1 : 0 });
  const result = plan.name
    ? await paasCall(`${API}.update_customer_subscription_plan`, {
        name: plan.name,
        data,
      })
    : await paasCall(`${API}.create_customer_subscription_plan`, { data });
  revalidatePath(PATH);
  return result;
}

export async function deleteCustomerSubscriptionPlan(name: string) {
  await paasCall(`${API}.delete_customer_subscription_plan`, { name });
  revalidatePath(PATH);
}

export type CustomerSubscriptionStatus =
  | "Pending"
  | "Active"
  | "Past Due"
  | "Cancelled"
  | "Expired";

export interface CustomerSubscriber {
  name: string;
  customer: string;
  plan: string;
  status: CustomerSubscriptionStatus;
  start_date?: string | null;
  end_date?: string | null;
  price?: number | null;
  payment_method?: "Wallet" | "Card" | null;
  auto_renew?: number | boolean | null;
  last_payment_error?: string | null;
  creation?: string;
}

export async function getCustomerSubscribers(
  status?: CustomerSubscriptionStatus | "",
  page: number = 1,
  limit: number = 50,
): Promise<CustomerSubscriber[]> {
  try {
    const data = await paasCall(`${API}.get_customer_subscriptions`, {
      limit_start: (page - 1) * limit,
      limit_page_length: limit,
      ...(status ? { status } : {}),
    });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch customer subscribers:", error);
    return [];
  }
}

export async function activateCustomerSubscription(name: string) {
  const result = await paasCall(`${API}.activate_customer_subscription`, {
    name,
  });
  revalidatePath(PATH);
  return result;
}

export async function cancelCustomerSubscriptionAdmin(name: string) {
  const result = await paasCall(`${API}.cancel_customer_subscription_admin`, {
    name,
  });
  revalidatePath(PATH);
  return result;
}
