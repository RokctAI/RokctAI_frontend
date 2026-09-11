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

/**
 * What the footer's status pill is entitled to claim.
 *
 * - `"online"`  — the platform gateway was asked, and it answered.
 * - `"offline"` — it was asked and did not answer: unreachable, non-2xx,
 *   timed out, or there is no base URL configured to ask at.
 * - `"hidden"`  — we were told not to ask at all
 *   (`ROKCT_STATUS_SOURCE=off` / `none`), so no pill is rendered.
 *
 * There is deliberately no state that renders nothing *because a probe
 * failed*. Vanishing belongs to the explicit off switch alone, so "told
 * not to ask" stays distinguishable from "asked and got nothing" — an
 * outage can never be mistaken for a build that simply shows no pill.
 */
export type PlatformStatus = "online" | "offline" | "hidden";

/**
 * The explicit off switch, mirroring base_sdk's footer chrome config:
 * `ROKCT_STATUS_SOURCE=off` (or `none`) suppresses the pill entirely,
 * for deployments that do not want to advertise platform liveness.
 */
function isStatusReportingOff(): boolean {
  const source = process.env.ROKCT_STATUS_SOURCE?.trim().toLowerCase();
  return source === "off" || source === "none";
}

export class VersionsService {
  /**
   * Liveness of the control plane, for the footer's status pill.
   *
   * ONE gateway call, made with `throwOnError: true` so that a missing
   * base URL, a non-2xx, a timeout, a network failure and a body that
   * will not parse all surface as a thrown `PlatformGatewayError` rather
   * than the gateway's default silent `null`.
   *
   * A throw is not the only way to come back with nothing: `platformCall`
   * returns `null` for a 2xx whose body parses to JSON `null`, without
   * throwing. So the answer is inspected as well as the asking, and
   * `"online"` requires both — the platform answered, and the answer
   * carried a value. A nothing-answer reads the same as no answer:
   * `"offline"`, because a status pill must never default to healthy.
   *
   * Never `"hidden"`: a probe that fails or comes back empty still
   * renders the honest red state. Vanishing belongs to the explicit off
   * switch alone.
   */
  static async getPlatformStatus(): Promise<PlatformStatus> {
    if (isStatusReportingOff()) return "hidden";

    try {
      const answer = await platformCall("control:get_versions", undefined, {
        baseUrl: process.env.ROKCT_BASE_URL,
        method: "GET",
        requireAuth: false,
        throwOnError: true,
        timeout: 5000,
        // Only a success is cached, and briefly: a stale "online" should
        // expire fast, and a throw is never cached, so an outage shows up
        // on the very next render.
        fetchOptions: { next: { revalidate: 60 } },
      });
      // A 2xx that yielded nothing is not an answer the pill may claim:
      // the gateway hands back `null` for a body that parses to `null`,
      // and nothing is thrown for it.
      return answer == null ? "offline" : "online";
    } catch {
      // Asked, got nothing. This is the honest red state, never a
      // silently-absent pill.
      return "offline";
    }
  }

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
      platformCall("rpanel.api.get_version", undefined, {
        baseUrl:
          process.env.NEXT_PUBLIC_FRAPPE_URL || process.env.ROKCT_BASE_URL,
      }),
    ]);

    // platformCall already unwraps Frappe's `message` envelope.
    const rokctData =
      rokctRes.status === "fulfilled" && rokctRes.value ? rokctRes.value : {};
    const paasVer =
      paasRes.status === "fulfilled" && paasRes.value ? paasRes.value : null;
    // `get_version` is annotated server-side as returning a dict but
    // actually returns the version string, and the static type here is
    // `unknown`, so a truthiness test would let an object through into
    // the rendered version line. Only a string is a version.
    const rpanelVer =
      rpanelRes.status === "fulfilled" && typeof rpanelRes.value === "string"
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
