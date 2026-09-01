/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
      GlobalSettingsService.getGlobalSettings(),
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
