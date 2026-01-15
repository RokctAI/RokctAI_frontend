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
    const { getGuestClient } = await import("@/app/lib/client");
    const frappe = getGuestClient();

    const result = await (frappe as any).call({
      method: "control.control.api.subscription.get_subscription_plans",
      args: category ? { category } : {}
    });

    // Determine data source: Frappe call returns { message: ... } usually
    const data = result.message || result;

    // Validate
    const validatedData = responseSchema.parse({ message: data });

    // Standardized Mapping
    const plans = validatedData.message.map(plan => ({
      ...plan,
      category: plan.category || plan.plan_category,
      type: plan.plan_type || "Tenant"
    }));
    return { success: true, data: plans };
  } catch (error: any) {
    console.error("getSubscriptionPlans Error:", error);
    return { success: false, error: error.message || "Unknown error occurred" };
  }
};
