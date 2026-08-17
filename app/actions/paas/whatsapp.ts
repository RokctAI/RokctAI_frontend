"use server";

import { paasCall } from "@/app/lib/paas-gateway";
import { auth } from "@/app/(auth)/auth";

export async function getWhatsAppConfig() {
  try {
    const config = await paasCall("whatsapp.utils.get_admin_whatsapp_config");
    return config;
  } catch (error) {
    // Log but don't crash if config doesn't exist yet (first run)
    console.warn("Failed to fetch WhatsApp config (might be empty):", error);
    return null;
  }
}

export async function updateWhatsAppConfig(data: any) {
  try {
    const result = await paasCall("whatsapp.utils.save_whatsapp_config", {
        enabled: data.enabled,
        phone_number_id: data.phone_number_id,
        access_token: data.access_token,
        app_secret: data.app_secret,
        verify_token: data.verify_token,
      });
    return result;
  } catch (error) {
    console.error("Failed to update WhatsApp config:", error);
    throw error;
  }
}

export async function getTenantId() {
  const session = await auth();
  const siteName = (session?.user as any)?.siteName || "local_tenant";
  return siteName.replace(/[^a-zA-Z0-9]/g, "_");
}
