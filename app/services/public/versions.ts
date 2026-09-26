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

// The platform version read: the versions this deployment is willing to
// state, for a footer's version slot.
//
// Two of the three probes that used to sit here could never answer,
// because neither cmd is reachable:
//
//  - `rpanel.api.get_version` is APP-PREFIXED, which the one gateway
//    routes nowhere. A tenant site resolves prefix-free dotted names
//    against the composed app's own whitelist, and a control site accepts
//    only cmds carrying the `control:` prefix (base_sdk
//    app/services/base/platform-gateway.ts). So it failed on every
//    install, not on some of them. Before it was a gateway call at all it
//    was `frappe.call({ method: "rpanel.api.get_version" })`, which
//    issued no request whatsoever - `FrappeApp.call()` takes ZERO
//    arguments and returns a `FrappeCall` builder (frappe-js-sdk 1.12.0,
//    `lib/frappe_app/index.d.ts`) - so the method name was discarded and
//    that SDK object flowed into `versions["rpanel"].version` where a
//    version string belongs.
//  - `api.get_version` is registered nowhere: not in base's frappe
//    manifest and not in the platform's hooks (base_sdk
//    components/custom/landing/footer-chrome-config.ts says so where it
//    names `api.system.api_status` as the one registered tenant cmd that
//    carries a version). It always came back null, so the `paas` entry it
//    guarded was never written.
//
// What is left is the one cmd that is actually registered and actually
// carries version numbers: control's `control:get_versions` map,
// guest-accessible, read through the one gateway door. Whatever it names,
// it names - nothing here hard-codes a product, a title or a number.

import { platformCall } from "@/app/services/base/platform-gateway";
import { GlobalSettingsService } from "@/app/services/control/global_settings";

/** One product line as a footer would show it: a title and a version. */
export interface PlatformVersion {
  title: string;
  version: string;
}

/** The versions the hub reported, keyed as the control map keys them. */
export type PlatformVersions = Record<string, PlatformVersion>;

/**
 * What a read with nothing to report comes back as: NO ENTRIES.
 *
 * The hub not answering is ordinary - it is unreachable, it timed out, or
 * it answered a non-2xx - and so is a hub that answers but names no
 * version. None of those is a fault worth raising: the read does not
 * throw, does not log and does not invent a number, and a footer's
 * version slot draws nothing for it (base_sdk's footer chrome hides an
 * empty `version`).
 */
export const NO_VERSIONS: PlatformVersions = Object.freeze({});

/** The one registered cmd that carries the control plane's version map. */
export const PUBLIC_VERSIONS_CMD = "control:get_versions";

/**
 * The version entries inside whatever the gateway handed back.
 *
 * An entry survives only when its `version` is a non-empty string - a
 * real answer. Anything else (a missing key, a null, a number, an object
 * where a version belongs) is dropped rather than passed on, so a slot
 * can never show a stringified object or a bare "Version". The entry's
 * own title is used when it has one; otherwise its key stands in, because
 * the title is the hub's to name, not this file's to guess.
 *
 * Frappe's `message` envelope is looked through the way base_sdk's probe
 * reader looks through it: `platformCall` strips one level already, and an
 * object whose ONLY key is `message` is still the envelope, not a version
 * map - including `{"message": null}`, which is what the gateway hands
 * back for a 2xx carrying nothing.
 */
export function readVersionMap(answer: unknown): PlatformVersions {
  if (answer === null || typeof answer !== "object" || Array.isArray(answer)) {
    return NO_VERSIONS;
  }

  const body = answer as Record<string, unknown>;
  const keys = Object.keys(body);
  if (keys.length === 1 && keys[0] === "message") {
    return readVersionMap(body.message);
  }

  const entries: PlatformVersions = {};
  for (const [key, value] of Object.entries(body)) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      continue;
    }
    const row = value as Record<string, unknown>;
    if (typeof row.version !== "string" || row.version.trim() === "") continue;
    entries[key] = {
      title:
        typeof row.title === "string" && row.title.trim() ? row.title : key,
      version: row.version,
    };
  }
  return Object.keys(entries).length > 0 ? entries : NO_VERSIONS;
}

export class VersionsService {
  /**
   * The platform versions, for a footer's version slot.
   *
   * ONE gateway call, and deliberately WITHOUT `throwOnError`: the
   * gateway's default contract is `null` on a missing base URL, a non-2xx,
   * a network failure or a timeout, which is exactly the set of ways an
   * unavailable hub shows up. Turning those into a throw would make an
   * ordinary unavailability look like a fault and oblige every caller to
   * write a try/catch to un-fault it. So the absence is a value:
   * [NO_VERSIONS].
   *
   * GET so Next.js fetch caching applies, guest so a footer can read it
   * for anonymous visitors.
   */
  static async getPublicVersions(): Promise<PlatformVersions> {
    const settings = await GlobalSettingsService.getGlobalSettings();
    const isDebug = settings?.isDebugMode ?? false;

    const answer = await platformCall<unknown>(PUBLIC_VERSIONS_CMD, undefined, {
      baseUrl: process.env.ROKCT_BASE_URL,
      method: "GET",
      requireAuth: false,
      headers: isDebug ? { "X-Rokct-Debug": "true" } : undefined,
      fetchOptions: { next: { revalidate: 300 } }, // Cache for 5 mins
    });

    return readVersionMap(answer);
  }
}
