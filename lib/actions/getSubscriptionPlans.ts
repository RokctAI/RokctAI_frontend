"use server";
// No longer needed, using environment variable directly
import { z } from "zod";

const subscriptionPlanSchema = z.object({
  name: z.string(),
  plan_name: z.string(),
  cost: z.union([z.number(), z.string()]).transform(v => typeof v === 'string' ? parseFloat(v) : v),
  billing_interval: z.union([z.string(), z.number()]).transform(v => String(v)),
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
    const baseUrl = process.env.ROKCT_BASE_URL || process.env.NEXT_PUBLIC_FRAPPE_URL;
    if (!baseUrl) throw new Error("Base URL not configured");

    const url = `${baseUrl}/api/v1/method/control.control.api.subscription.get_subscription_plans${category ? `?category=${category}` : ''}`;

    // Use no-store to ensure fresh pricing data
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store"
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Pricing Fetch Failed: ${response.status}`, errorBody);
      throw new Error(`Request failed: ${response.status}`);
    }

    const result = await response.json();
    const validatedData = responseSchema.parse(result);
    // Standardized Mapping: Backend already correctly maps plan_category -> category
    const plans = validatedData.message.map(plan => ({
      ...plan,
      category: plan.category || plan.plan_category,
      type: plan.plan_type || "Tenant" // Default to Tenant if missing
    }));
    return { success: true, data: plans };
  } catch (error: any) {
    console.error("getSubscriptionPlans Error:", error);
    return { success: false, error: error.message || "Unknown error occurred" };
  }
};
