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

export class RoadmapPublicService {
  /**
   * The published roadmap, for `/public/roadmap` and the footer link.
   *
   * Rides the ONE platform gateway (ADR-005) like every other call in
   * this tree, never a per-method URL: `cmd` is the dotted method with
   * the app prefix stripped, per the contract in app/lib/gateway-rpc.ts.
   *
   * It has to, because what it replaced never made a request at all.
   * `FrappeApp.call()` takes ZERO arguments and returns a `FrappeCall`,
   * so `client.call("rcore.…get_public_roadmap_content")` discarded the
   * method name and handed its caller that `FrappeCall` object instead —
   * truthy, `message`-less, and not a roadmap. An `as any` is what let it
   * compile. Both consumers read `res.message || res`, which
   * `platformCall` satisfies: it unwraps the Frappe `message` envelope,
   * and returns `null` on any failure, so a roadmap that cannot be
   * fetched now reads as "none published" instead of as an object.
   *
   * Guest call (the roadmap is public), GET so Next.js caches it, on the
   * same 60s revalidate as the page that renders it.
   */
  static async getPublicRoadmap() {
    return platformCall<Record<string, any>>(
      "roadmap.doctype.roadmap_settings.roadmap_settings.get_public_roadmap_content",
      undefined,
      {
        baseUrl:
          process.env.NEXT_PUBLIC_FRAPPE_URL || process.env.ROKCT_BASE_URL,
        method: "GET",
        requireAuth: false,
        fetchOptions: { next: { revalidate: 60 } },
      },
    );
  }
}
