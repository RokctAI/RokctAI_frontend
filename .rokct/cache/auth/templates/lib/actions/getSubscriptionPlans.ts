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
// No longer needed, using environment variable directly
import { z } from "zod";

import { platformCall } from "@/app/services/base/platform-gateway";

const subscriptionPlanSchema = z.object({
  name: z.string(),
  plan_name: z.string(),
  cost: z
    .union([z.number(), z.string()])
    .transform((v) => (typeof v === "string" ? parseFloat(v) : v)),
  billing_interval: z
    .union([z.string(), z.number()])
    .transform((v) => String(v)),
  // Standardized fields from Backend
  trial_period_days: z.number().optional().nullable(),
  is_per_seat_plan: z.number().optional().nullable(),
  base_user_count: z.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  features: z.array(z.string()).optional().nullable().default([]),
  category: z.string().optional().nullable(),
  plan_category: z.string().optional().nullable(),
  plan_type: z.string().optional().nullable(),
  is_ai: z.number().optional().nullable(),
});

const responseSchema = z.object({
  message: z.array(subscriptionPlanSchema),
});

export const getSubscriptionPlans = async (category?: string) => {
  try {
    // Fallback to NEXT_PUBLIC_FRAPPE_URL if ROKCT_BASE_URL is missing
    const baseUrl =
      process.env.ROKCT_BASE_URL || process.env.NEXT_PUBLIC_FRAPPE_URL;
    if (!baseUrl) throw new Error("Base URL not configured");

    // Universal gateway call — the control gateway only serves
    // `control:`-prefixed cmds; this is the subscriptions manifest's
    // `control:get_subscription_plans` key. Use no-store to ensure fresh
    // pricing data.
    const message = await platformCall<unknown>(
      "control:get_subscription_plans",
      category ? { category } : undefined,
      {
        baseUrl,
        fetchOptions: { cache: "no-store" },
      },
    );

    if (!message) {
      console.error("Pricing Fetch Failed");
      throw new Error("Request failed");
    }

    const validatedData = responseSchema.parse({ message });
    // Standardized Mapping: Backend already correctly maps plan_category -> category
    const plans = validatedData.message.map((plan) => ({
      ...plan,
      category: plan.category || plan.plan_category,
      type: plan.plan_type || "Tenant", // Default to Tenant if missing
    }));
    return { success: true, data: plans };
  } catch (error: any) {
    console.error("getSubscriptionPlans Error:", error);
    return { success: false, error: error.message || "Unknown error occurred" };
  }
};
