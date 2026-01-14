"use server";
import { z } from "zod";

const SubscriptionPlanSchema = z.object({
  "name": z.string().optional(),
  "plan_name": z.string().optional(),
  "currency": z.string().optional(),
  "column_break_3": z.any().optional(),
  "item": z.string().optional(),
  "section_break_5": z.any().optional(),
  "price_determination": z.any().optional(),
  "column_break_7": z.any().optional(),
  "cost": z.number().optional(),
  "price_list": z.string().optional(),
  "section_break_11": z.any().optional(),
  "billing_interval": z.any().optional(),
  "column_break_13": z.any().optional(),
  "billing_interval_count": z.number().optional(),
  "payment_plan_section": z.any().optional(),
  "product_price_id": z.string().optional(),
  "column_break_16": z.any().optional(),
  "payment_gateway": z.string().optional(),
  "accounting_dimensions_section": z.any().optional(),
  "cost_center": z.string().optional(),
  "dimension_col_break": z.any().optional()
});

export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>;

export async function updateSubscriptionPlan(
  name: string, doc: Partial<SubscriptionPlan>, apiKey: string, apiSecret: string
): Promise<SubscriptionPlan> {
  const response = await fetch(`/api/v1/resource/Subscription%20Plan/${encodeURIComponent(name)}`, {
    method: "PUT",
    headers: {
      "Authorization": `token ${apiKey}:${apiSecret}`,
      "X-Action-Source": "AI",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(doc),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to update subscription plan: ${errorBody}`);
  }
  
  
  
  const result = await response.json();
  return result.data;
}