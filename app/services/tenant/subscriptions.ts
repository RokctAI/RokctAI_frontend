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

export class SubscriptionService {
  /**
   * The tenant's plan and status, through the ONE platform gateway
   * (ADR-005) rather than a per-method URL.
   *
   * What it replaced never made a request: `FrappeApp.call()` takes ZERO
   * arguments and returns a `FrappeCall` (frappe-js-sdk 1.12.0,
   * `lib/frappe_app/index.d.ts`), so the `{method, args}` object was
   * discarded and `response.message` read `undefined` off an SDK builder.
   * Every caller therefore got the "Simple"/"Active" fallback below, on
   * every render, with no network activity behind it. The `as any` is what
   * let it compile.
   *
   * The cmd is the manifest key minus the app prefix, per
   * app/lib/gateway-rpc.ts — the old string also carried the wrong prefix
   * (`core.`, not `rcore.`). `platformCall` already unwraps the Frappe
   * `message` envelope, so the details object arrives directly.
   */
  static async getSubscriptionStatus() {
    try {
      const response = await platformCall<Record<string, any>>(
        "tenant.api.get_subscription_details",
        undefined,
        { throwOnError: true },
      );
      return response || { plan_name: "Simple", status: "Active" };
    } catch (e) {
      return { plan_name: "Simple", status: "Active" };
    }
  }
}
