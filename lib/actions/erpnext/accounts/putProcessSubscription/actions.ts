"use server";
import { z } from "zod";

const ProcessSubscriptionSchema = z.object({
  "name": z.string().optional(),
  "posting_date": z.string().optional(),
  "subscription": z.string().optional(),
  "amended_from": z.string().optional()
});

export type ProcessSubscription = z.infer<typeof ProcessSubscriptionSchema>;

export async function updateProcessSubscription(
  name: string, doc: Partial<ProcessSubscription>, apiKey: string, apiSecret: string
): Promise<ProcessSubscription> {
  const response = await fetch(`/api/v1/resource/Process%20Subscription/${encodeURIComponent(name)}`, {
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
    throw new Error(`Failed to update process subscription: ${errorBody}`);
  }
  
  
  
  const result = await response.json();
  return result.data;
}