"use server";
import { z } from "zod";

const SubscriptionSettingsSchema = z.object({
  "name": z.string().optional(),
  "default_trial_plan": z.string().optional(),
  "default_trial_days": z.number().optional(),
  "grace_period_days": z.number().optional(),
  "subscription_cache_duration": z.number().optional(),
  "marketing_site_login_url": z.string().optional(),
  "default_login_redirect_url": z.string().optional()
});

export type SubscriptionSettings = z.infer<typeof SubscriptionSettingsSchema>;

export async function updateSubscriptionSettings(
  doc: Partial<SubscriptionSettings>, apiKey: string, apiSecret: string
): Promise<SubscriptionSettings> {
  const response = await fetch(`/api/v1/resource/Subscription%20Settings`, {
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
    throw new Error(`Failed to update subscription settings: ${errorBody}`);
  }
  
  
  
  const result = await response.json();
  return result.data;
}