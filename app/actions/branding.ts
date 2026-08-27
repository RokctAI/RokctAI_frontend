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
