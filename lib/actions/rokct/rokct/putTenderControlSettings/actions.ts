"use server";
import { z } from "zod";

const TenderControlSettingsSchema = z.object({
  "name": z.string().optional(),
  "tender_country": z.string().optional()
});

export type TenderControlSettings = z.infer<typeof TenderControlSettingsSchema>;

export async function updateTenderControlSettings(
  doc: Partial<TenderControlSettings>, apiKey: string, apiSecret: string
): Promise<TenderControlSettings> {
  const response = await fetch(`/api/v1/resource/Tender%20Control%20Settings`, {
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
    throw new Error(`Failed to update tender control settings: ${errorBody}`);
  }
  
  
  
  const result = await response.json();
  return result.data;
}