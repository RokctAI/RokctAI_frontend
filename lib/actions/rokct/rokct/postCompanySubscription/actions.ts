"use server";
import { z } from "zod";

const CompanySubscriptionSchema = z.object({
  "name": z.string().optional(),
  "customer": z.string().optional(),
  "site_name": z.string().optional(),
  "plan": z.string().optional(),
  "previous_plan": z.string().optional(),
  "status": z.any().optional(),
  "trial_ends_on": z.string().optional(),
  "subscription_start_date": z.string().optional(),
  "next_billing_date": z.string().optional(),
  "custom_login_redirect_url": z.string().optional(),
  "column_break_1": z.any().optional(),
  "api_secret": z.any().optional(),
  "email_verified_on": z.string().optional(),
  "payment_retry_attempt": z.number().optional(),
  "user_quantity": z.number().optional(),
  "ai_features_section": z.any().optional(),
  "enable_ai_developer_features": z.number().optional()
});

export type CompanySubscription = z.infer<typeof CompanySubscriptionSchema>;

export async function createCompanySubscription(
  doc: CompanySubscription, apiKey: string, apiSecret: string
): Promise<CompanySubscription> {
  const response = await fetch(`/api/v1/resource/Company%20Subscription`, {
    method: "POST",
    headers: {
      "Authorization": `token ${apiKey}:${apiSecret}`,
      "X-Action-Source": "AI",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(doc),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to create company subscription: ${errorBody}`);
  }
  
  
  
  const result = await response.json();
  return result.data;
}