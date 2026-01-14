"use server";
import { z } from "zod";

const WeatherSettingsSchema = z.object({
  "name": z.string().optional(),
  "weatherapi_com_api_key": z.any().optional(),
  "default_location": z.string().optional()
});

export type WeatherSettings = z.infer<typeof WeatherSettingsSchema>;

export async function updateWeatherSettings(
  doc: Partial<WeatherSettings>, apiKey: string, apiSecret: string
): Promise<WeatherSettings> {
  const response = await fetch(`/api/v1/resource/Weather%20Settings`, {
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
    throw new Error(`Failed to update weather settings: ${errorBody}`);
  }
  
  
  
  const result = await response.json();
  return result.data;
}