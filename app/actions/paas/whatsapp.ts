/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
