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

import { CommercialService } from "@/app/services/all/crm/commercial";
import { revalidatePath } from "next/cache";
import { verifyCrmRole } from "@/app/lib/roles";

// --- SUBSCRIPTIONS ---

/**
 * Fetches Subscription Plans.
 */
export async function getSubscriptionPlans() {
  if (!(await verifyCrmRole())) return [];
  try {
    const res = await CommercialService.getSubscriptionPlans();
    return res.data;
  } catch (e) {
    return [];
  }
}

/**
 * Creates a Subscription Plan.
 */
export async function createSubscriptionPlan(data: {
  plan_name: string;
  currency: string;
  cost: number;
  billing_interval: "Month" | "Year";
}) {
  if (!(await verifyCrmRole()))
    return { success: false, error: "Unauthorized" };
  try {
    const response = await CommercialService.createSubscriptionPlan(data);
    revalidatePath("/handson/all/accounting/selling/subscriptions/plan");
    return { success: true, message: response };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}

/**
 * Fetches Subscriptions.
 */
export async function getSubscriptions() {
  if (!(await verifyCrmRole())) return [];
  try {
    const res = await CommercialService.getSubscriptions();
    return res.data;
  } catch (e) {
    return [];
  }
}

/**
 * Creates a Subscription.
 */
export async function createSubscription(data: {
  party_type: string;
  party: string;
  plans: { plan: string; qty: number }[];
}) {
  if (!(await verifyCrmRole()))
    return { success: false, error: "Unauthorized" };
  try {
    const response = await CommercialService.createSubscription(data);
    revalidatePath(
      "/handson/all/accounting/selling/subscriptions/subscription",
    );
    return { success: true, message: response };
  } catch (e: any) {
    return { success: false, error: e?.message || "Error" };
  }
}
