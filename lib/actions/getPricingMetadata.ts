/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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

import { z } from "zod";
import { getGuestCountryCode } from "@/app/services/common/geoip";
import { GlobalSettingsService } from "@/app/services/control/global_settings";
import { callPublicApi } from "@/app/services/common/api";

const responseSchema = z.object({
  message: z.object({
    currency: z.string(),
    currency_symbol: z.string().optional(),
    exchange_rate: z.number(),
    country_code: z.string().nullable().optional(),
    country_name: z.string().nullable().optional(),
    ip: z.string().nullable().optional(),
  }),
});

export async function getPricingMetadata(userCountry?: string) {
  try {
    let countryCode = userCountry;
    let countryName = "";
    let currencyHint = "";

    if (!countryCode) {
      const geo = await getGuestCountryCode();
      countryCode = geo.countryCode;
      countryName = geo.countryName || "";
      currencyHint = geo.currency || ""; // Get currency from GeoIP
      (global as any).lastIp = (geo as any).ip; // Store for fallback return
    }

    // Pass the full name as well for better backend resolution (matches register flow)
    const params: Record<string, any> = {};
    if (countryCode) params.country_code = countryCode;
    if (countryName) params.country = countryName;
    if (currencyHint) params.currency_hint = currencyHint;

    const settings = await GlobalSettingsService.getGlobalSettings();
    const isDebug = settings?.isDebugMode ?? false;

    if (isDebug) {
      console.log(
        `[getPricingMetadata] Requesting: code=${countryCode}, name=${countryName}, currency_hint=${currencyHint}`,
      );
    }

    const data = await callPublicApi(
      "control.control.api.subscription.get_pricing_metadata",
      params,
      {
        headers: isDebug ? { "X-Rokct-Debug": "true" } : {},
        next: { revalidate: 3600 }, // Cache for 1 hour
        timeout: 3000, // 3s Timeout (Restored)
      },
    );

    const fallbackData = {
      currency: "USD",
      currency_symbol: "$",
      exchange_rate: 1.0,
      country_code: countryCode || "US",
      ip: (global as any).lastIp || null,
    };

    if (!data) return fallbackData;

    const innerSchema = responseSchema.shape.message;
    const validated = innerSchema.safeParse(data);

    if (validated.success) {
      return {
        ...validated.data,
        ip: (global as any).lastIp || validated.data.ip,
      };
    } else {
      if (isDebug)
        console.warn("Pricing Metadata Schema Mismatch:", validated.error);

      return {
        currency: data.currency || "USD",
        currency_symbol: data.currency_symbol || "$",
        exchange_rate: data.exchange_rate || 1.0,
        country_code: data.country_code || countryCode || "US",
        ip: (global as any).lastIp || data.ip || null,
      };
    }
  } catch (error) {
    console.error("Error in getPricingMetadata:", error);
    return {
      currency: "USD",
      currency_symbol: "$",
      exchange_rate: 1.0,
      country_code: "US",
      ip: null,
    };
  }
}
