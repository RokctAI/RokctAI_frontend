"use server";

import { getPaaSClient } from "@/app/lib/client";

export async function getWhatsAppConfig() {
    const frappe = await getPaaSClient();

    try {
        const config = await frappe.call({
            method: "paas.paas.whatsapp.utils.get_admin_whatsapp_config",
        });
        return config;
    } catch (error) {
        // Log but don't crash if config doesn't exist yet (first run)
        console.warn("Failed to fetch WhatsApp config (might be empty):", error);
        return null;
    }
}

export async function updateWhatsAppConfig(data: any) {
    const frappe = await getPaaSClient();

    try {
        const result = await frappe.call({
            method: "paas.paas.whatsapp.utils.save_whatsapp_config",
            args: {
                enabled: data.enabled,
                phone_number_id: data.phone_number_id,
                access_token: data.access_token,
                app_secret: data.app_secret,
                verify_token: data.verify_token
            }
        });
        return result;
    } catch (error) {
        console.error("Failed to update WhatsApp config:", error);
        throw error;
    }
}
