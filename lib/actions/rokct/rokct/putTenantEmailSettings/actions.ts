"use server";
import { z } from "zod";

const TenantEmailSettingsSchema = z.object({
  "name": z.string().optional(),
  "enable_custom_smtp": z.number().optional(),
  "smtp_server": z.string().optional(),
  "smtp_port": z.number().optional(),
  "use_tls": z.number().optional(),
  "username": z.string().optional(),
  "password": z.any().optional()
});

export type TenantEmailSettings = z.infer<typeof TenantEmailSettingsSchema>;

export async function updateTenantEmailSettings(
  doc: Partial<TenantEmailSettings>, apiKey: string, apiSecret: string
): Promise<TenantEmailSettings> {
  const response = await fetch(`/api/v1/resource/Tenant%20Email%20Settings`, {
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
    throw new Error(`Failed to update tenant email settings: ${errorBody}`);
  }
  
  
  
  const result = await response.json();
  return result.data;
}