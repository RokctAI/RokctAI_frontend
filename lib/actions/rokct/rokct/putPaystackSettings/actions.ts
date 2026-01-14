"use server";
import { z } from "zod";

const PaystackSettingsSchema = z.object({
  "name": z.string().optional(),
  "section_break_1": z.any().optional(),
  "secret_key": z.any().optional(),
  "public_key": z.string().optional()
});

export type PaystackSettings = z.infer<typeof PaystackSettingsSchema>;

export async function updatePaystackSettings(
  doc: Partial<PaystackSettings>, apiKey: string, apiSecret: string
): Promise<PaystackSettings> {
  const response = await fetch(`/api/v1/resource/Paystack%20Settings`, {
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
    throw new Error(`Failed to update paystack settings: ${errorBody}`);
  }
  
  
  
  const result = await response.json();
  return result.data;
}