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
        ip: z.string().nullable().optional()
    })
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
            console.log(`[getPricingMetadata] Requesting: code=${countryCode}, name=${countryName}, currency_hint=${currencyHint}`);
        }

        const data = await callPublicApi(
            "control.control.api.subscription.get_pricing_metadata",
            params,
            {
                headers: isDebug ? { "X-Rokct-Debug": "true" } : {},
                next: { revalidate: 3600 }, // Cache for 1 hour
                timeout: 3000 // 3s Timeout (Restored)
            }
        );

        const fallbackData = {
            currency: "USD",
            currency_symbol: "$",
            exchange_rate: 1.0,
            country_code: countryCode || "US",
            ip: (global as any).lastIp || null
        };

        if (!data) return fallbackData;

        const innerSchema = responseSchema.shape.message;
        const validated = innerSchema.safeParse(data);

        if (validated.success) {
            return { ...validated.data, ip: (global as any).lastIp || validated.data.ip };
        } else {
            if (isDebug) console.warn("Pricing Metadata Schema Mismatch:", validated.error);

            return {
                currency: data.currency || "USD",
                currency_symbol: data.currency_symbol || "$",
                exchange_rate: data.exchange_rate || 1.0,
                country_code: data.country_code || countryCode || "US",
                ip: (global as any).lastIp || data.ip || null
            };
        }
    } catch (error) {
        console.error("Error in getPricingMetadata:", error);
        return {
            currency: "USD",
            currency_symbol: "$",
            exchange_rate: 1.0,
            country_code: "US",
            ip: null
        };
    }
}
