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

import { platformCall } from "@/app/services/base/platform-gateway";
import { GlobalSettingsService } from "@/app/services/control/global_settings";

export class VersionsService {
  static async getPublicVersions() {
    const settings = await GlobalSettingsService.getGlobalSettings();
    const isDebug = settings?.isDebugMode ?? false;

    // Control-plane versions ride the ONE platform gateway (`control:` cmd
    // from control's override_whitelisted_methods), never a per-method URL.
    // GET keeps Next.js fetch caching (`next.revalidate`) as before.
    const rokctFetch = platformCall<Record<string, any>>(
      "control:get_versions",
      undefined,
      {
        baseUrl: process.env.ROKCT_BASE_URL,
        method: "GET",
        requireAuth: false,
        headers: isDebug ? { "X-Rokct-Debug": "true" } : undefined,
        fetchOptions: { next: { revalidate: 300 } }, // Cache for 5 mins
      },
    );

    const [rokctRes, paasRes, rpanelRes] = await Promise.allSettled([
      rokctFetch,
      platformCall("api.get_version", undefined, {
        baseUrl:
          process.env.NEXT_PUBLIC_FRAPPE_URL || process.env.ROKCT_BASE_URL,
      }),
      // The rpanel probe rides the same gateway as the paas one above.
      // It used to be `frappe.call({ method: "rpanel.api.get_version" })`,
      // which made no request at all: `FrappeApp.call()` takes ZERO
      // arguments and returns a `FrappeCall` (frappe-js-sdk 1.12.0,
      // `lib/frappe_app/index.d.ts`), so the method name was discarded and
      // that SDK builder object flowed into `versions["rpanel"].version`
      // where a version string belongs. Guest, as the bare client was.
      platformCall<string>("rpanel.api.get_version", undefined, {
        baseUrl:
          process.env.NEXT_PUBLIC_FRAPPE_URL || process.env.ROKCT_BASE_URL,
        requireAuth: false,
      }),
    ]);

    // platformCall already unwraps Frappe's `message` envelope.
    const rokctData =
      rokctRes.status === "fulfilled" && rokctRes.value ? rokctRes.value : {};
    const paasVer =
      paasRes.status === "fulfilled" && paasRes.value ? paasRes.value : null;
    const rpanelVer =
      rpanelRes.status === "fulfilled" && rpanelRes.value
        ? rpanelRes.value
        : null;

    // Merge datas
    const versions = {
      ...rokctData,
    };

    // Override or ensure specific versions if direct calls succeeded
    if (paasVer) {
      versions["paas"] = { title: "PaaS", version: paasVer };
    }
    if (rpanelVer) {
      versions["rpanel"] = { title: "RPanel", version: rpanelVer };
    }

    return versions;
  }
}
