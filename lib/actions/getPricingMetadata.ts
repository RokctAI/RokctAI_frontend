"use server";

import { z } from "zod";
import { getGuestCountryCode } from "@/app/services/common/geoip";
import { GlobalSettingsService } from "@/app/services/control/global_settings";

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
        const params = new URLSearchParams();
        if (countryCode) params.append("country_code", countryCode);
        if (countryName) params.append("country", countryName);
        if (currencyHint) params.append("currency_hint", currencyHint); // Add currency_hint

        const settings = await GlobalSettingsService.getGlobalSettings();
        const isDebug = settings?.isDebugMode ?? false;

        if (isDebug) {
            console.log(`[getPricingMetadata] Requesting: code=${countryCode}, name=${countryName}, currency_hint=${currencyHint}`);
        }

        const response = await fetch(
            `${process.env.ROKCT_BASE_URL}/api/method/control.control.api.subscription.get_pricing_metadata?${params.toString()}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    ...(isDebug ? { "X-Rokct-Debug": "true" } : {})
                },
                next: { revalidate: 3600 } // Cache for 1 hour
            }
        );

        const fallbackData = {
            currency: "USD",
            currency_symbol: "$",
            exchange_rate: 1.0,
            country_code: countryCode || "US",
            ip: (global as any).lastIp || null
        };

        if (!response.ok) {
            return fallbackData;
        }

        const result = await response.json();
        const validated = responseSchema.safeParse(result);

        if (validated.success) {
            return { ...validated.data.message, ip: (global as any).lastIp || validated.data.message.ip };
        } else {
            // Fallback if schema doesn't match
            return fallbackData;
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
