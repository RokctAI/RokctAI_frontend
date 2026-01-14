"use server";
import { z } from "zod";

const StorageSettingsSchema = z.object({
  "name": z.string().optional(),
  "current_storage_usage_mb": z.number().optional()
});

export type StorageSettings = z.infer<typeof StorageSettingsSchema>;

export async function updateStorageSettings(
  doc: Partial<StorageSettings>, apiKey: string, apiSecret: string
): Promise<StorageSettings> {
  const response = await fetch(`/api/v1/resource/Storage%20Settings`, {
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
    throw new Error(`Failed to update storage settings: ${errorBody}`);
  }
  
  
  
  const result = await response.json();
  return result.data;
}