"use server";

import { PLATFORM_NAME, BRANDING_COUNTRY_INDEX } from "@/app/config/constants";
import { getGuestCountryCode } from "@/app/services/common/geoip";
import { GlobalSettingsService } from "@/app/services/control/global_settings";

/**
 * Server action to fetch branding data.
 * This ensures database and header access stays on the server.
 */
export async function fetchBrandingData() {
    try {
        const [geo, settings] = await Promise.all([
            getGuestCountryCode(),
            GlobalSettingsService.getGlobalSettings()
        ]);

        return {
            name: PLATFORM_NAME,
            code: geo.countryCode,
            countryName: geo.countryName,
            showBeta: settings?.isBetaMode ?? true,
            before: PLATFORM_NAME.substring(0, BRANDING_COUNTRY_INDEX),
            after: PLATFORM_NAME.substring(BRANDING_COUNTRY_INDEX),
        };
    } catch (e) {
        console.error("Failed to fetch branding data:", e);
        return {
            name: PLATFORM_NAME,
            code: "",
            countryName: "",
            showBeta: true,
            before: PLATFORM_NAME,
            after: "",
        };
    }
}
