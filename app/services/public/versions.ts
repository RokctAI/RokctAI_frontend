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

import { getGuestClient } from "@/app/lib/client";
import { platformCall } from "@/app/services/base/platform-gateway";
import { GlobalSettingsService } from "@/app/services/control/global_settings";

export class VersionsService {
  static async getPublicVersions() {
    const frappe = getGuestClient();

    const settings = await GlobalSettingsService.getGlobalSettings();
    const isDebug = settings?.isDebugMode ?? false;

    // Use fetch for rokct to ensure headers are passed reliably
    const rokctFetch = fetch(
      `${process.env.ROKCT_BASE_URL}/api/method/control.control.api.versions.get_versions`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(isDebug ? { "X-Rokct-Debug": "true" } : {}),
        },
        next: { revalidate: 300 }, // Cache for 5 mins
      },
    )
      .then((res) => res.json())
      .catch(() => ({}));

    const [rokctRes, paasRes, rpanelRes] = await Promise.allSettled([
      rokctFetch,
      platformCall("api.get_version", undefined, {
        baseUrl:
          process.env.NEXT_PUBLIC_FRAPPE_URL || process.env.ROKCT_BASE_URL,
      }),
      frappe.call({ method: "rpanel.api.get_version" }),
    ]);

    const rokctDataRaw = rokctRes.status === "fulfilled" ? rokctRes.value : {};
    const rokctData = rokctDataRaw.message || rokctDataRaw || {};
    const paasVer =
      paasRes.status === "fulfilled" && paasRes.value ? paasRes.value : null;
    const rpanelVer =
      rpanelRes.status === "fulfilled"
        ? rpanelRes.value.message || rpanelRes.value
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
