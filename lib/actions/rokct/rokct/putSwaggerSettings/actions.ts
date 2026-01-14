"use server";
import { z } from "zod";

const SwaggerSettingsSchema = z.object({
  "name": z.string().optional(),
  "basic_settings_section": z.any().optional(),
  "app_name": z.string().optional(),
  "column_break_yztn": z.any().optional(),
  "refresh_app_list": z.any().optional(),
  "generate_swagger_json": z.any().optional(),
  "rsync_destination": z.string().optional(),
  "auth_settings_section": z.any().optional(),
  "token_based_basicauth": z.number().optional(),
  "column_break_lxux": z.any().optional(),
  "bearerauth": z.number().optional(),
  "status_section": z.any().optional(),
  "last_generation_time": z.string().optional(),
  "generation_status": z.any().optional(),
  "generation_log": z.any().optional(),
  "exclusions_section": z.any().optional(),
  "excluded_modules": z.array(z.object({"module": z.string()})).optional(),
  "excluded_doctypes": z.array(z.object({"doctype": z.string()})).optional(),
  "renaming_section": z.any().optional(),
  "app_renaming_rules": z.array(z.object({"original_name": z.any(), "new_name": z.string()})).optional(),
  "installed_apps_cache": z.string().optional()
});

export type SwaggerSettings = z.infer<typeof SwaggerSettingsSchema>;

export async function updateSwaggerSettings(
  doc: Partial<SwaggerSettings>, apiKey: string, apiSecret: string
): Promise<SwaggerSettings> {
  const response = await fetch(`/api/v1/resource/Swagger%20Settings`, {
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
    throw new Error(`Failed to update swagger settings: ${errorBody}`);
  }
  
  
  
  const result = await response.json();
  return result.data;
}