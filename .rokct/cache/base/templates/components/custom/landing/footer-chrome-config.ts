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

// The generic chrome of a page foot: the copyright line, the platform
// status indicator and the version string. Shell-agnostic on purpose -
// every rokct shell grows the same row, so it lives here rather than being
// copied per product (the scrollbar treatment moved for the same reason).
//
// This module holds the WIRE and the WORDS; components/custom/footer-chrome.tsx
// holds the markup and app/actions/base/status.ts holds the fetch. Nothing
// here names a product, a brand colour or a company: every value is either
// read from the environment or handed in by the shell or the home SDK that
// renders the row.

/**
 * What the status indicator is saying.
 *
 *  - `operational`   a probe answered and reported a healthy site.
 *  - `maintenance`   a probe answered and reported `maintenance_mode`.
 *  - `offline`       every probe was attempted and none answered.
 *  - `unconfigured`  no probe could even be attempted (no backend origin is
 *                    set for this deployment). NOT the same as "down", so
 *                    the row hides the indicator instead of claiming a
 *                    failure the site has no evidence for.
 */
export type PlatformStatusState =
  | "operational"
  | "maintenance"
  | "offline"
  | "unconfigured";

/** Which site in the fleet a probe asks. */
export type PlatformStatusSite = "tenant" | "control";

/**
 * One status probe: a gateway `cmd` and the site that should answer it.
 *
 * Every call goes through the ONE platform gateway
 * (`/api/v1/method/rokct.platform.api`, `cmd` in the body) - never a dotted
 * method URL - so `site` only decides which base URL the gateway call is
 * pointed at: the tenant resolved for this request, or the control plane.
 */
export interface PlatformStatusProbe {
  site: PlatformStatusSite;
  cmd: string;
  payload?: Record<string, unknown>;
}

/**
 * The default probe order: ASK THE TENANT FIRST, fall back to control.
 *
 * Both cmds are guest-accessible, which the row needs because it renders
 * for anonymous visitors:
 *
 *  - `api.system.api_status` is base_sdk's own tenant endpoint
 *    (core base/frappe src/tenant/api/system/system.py, manifest key
 *    `{app_name}.api.system.api_status`), `@frappe.whitelist(allow_guest=True)`.
 *    It answers `{status: "ok" | "maintenance", version, user}`, so the
 *    tenant can report maintenance mode about ITSELF - which is the state a
 *    visitor to that tenant actually cares about.
 *  - `control:get_versions` is the control plane's version map
 *    (control hooks `control:get_versions`), also `allow_guest=True`, and is
 *    what rokct.ai's host footer reads today. A control site accepts only
 *    `control:`-prefixed cmds, hence the prefix.
 *
 * Tenant first because a tenant site that is up can speak for itself and
 * for its own maintenance window; control answers for the fleet when the
 * tenant cannot be reached or this deployment has no tenant of its own.
 * [resolvePlatformStatusProbes] lets a deployment reorder or narrow this
 * without a new SDK release.
 */
export const PLATFORM_STATUS_PROBES: readonly PlatformStatusProbe[] = [
  { site: "tenant", cmd: "api.system.api_status" },
  { site: "control", cmd: "control:get_versions" },
];

/**
 * The probes to run, from a comma-separated list of sites - the value of
 * `ROKCT_STATUS_SOURCE`. Unset (or unrecognised) keeps
 * [PLATFORM_STATUS_PROBES] as it is; `off` runs nothing, so the indicator
 * reports `unconfigured` and the row hides it.
 *
 * Configured rather than hard-coded so "which site answers for status" can
 * be flipped per deployment - `ROKCT_STATUS_SOURCE=control` pins a shell to
 * the control plane, `tenant` pins it to its own backend - without another
 * SDK release.
 */
export function resolvePlatformStatusProbes(
  source?: string | null,
): PlatformStatusProbe[] {
  const raw = (source ?? "").trim().toLowerCase();
  if (!raw) return [...PLATFORM_STATUS_PROBES];
  if (raw === "off" || raw === "none") return [];

  const wanted = raw
    .split(",")
    .map((part) => part.trim())
    .filter((part): part is PlatformStatusSite =>
      part === "tenant" || part === "control",
    );
  if (wanted.length === 0) return [...PLATFORM_STATUS_PROBES];

  // Named order wins, and a site named twice is probed once.
  const seen = new Set<PlatformStatusSite>();
  const probes: PlatformStatusProbe[] = [];
  for (const site of wanted) {
    if (seen.has(site)) continue;
    seen.add(site);
    const probe = PLATFORM_STATUS_PROBES.find((p) => p.site === site);
    if (probe) probes.push(probe);
  }
  return probes;
}

/** What [getPlatformStatus] answers. */
export interface PlatformStatus {
  state: PlatformStatusState;
  /** The site that answered, or `null` when none did. */
  site: PlatformStatusSite | null;
  /** Whatever version the answering probe reported, when it reported one. */
  version?: string | null;
}

/** The words the row puts on screen. Override any of them per product. */
export interface FooterChromeLabels {
  /** Shown before the state on wide screens only ("System Online"). */
  statusPrefix: string;
  operational: string;
  maintenance: string;
  offline: string;
  /** While the first probe is still in flight. */
  checking: string;
  /** Shown before the version string ("Version 1.4.3"). */
  version: string;
}

export const FOOTER_CHROME_LABELS: FooterChromeLabels = {
  statusPrefix: "System",
  operational: "Online",
  maintenance: "Maintenance",
  offline: "Offline",
  checking: "Checking",
  version: "Version",
};

/**
 * The colour of the status dot per state.
 *
 * These three are SEMANTIC, not brand: green/amber/red is the convention a
 * visitor reads without a legend, and painting them in the product's hue
 * would destroy the signal (an orange dot on an orange page says nothing).
 * They are still values, not literals in the markup, so a shell whose
 * palette already carries semantic tokens passes those instead - Supacharge
 * hands in `var(--sc-success)` / `var(--sc-star)` / `var(--sc-danger)`.
 */
export type FooterChromeStatusColors = Partial<
  Record<PlatformStatusState | "checking", string>
>;

export const FOOTER_CHROME_STATUS_COLORS: Required<
  Omit<FooterChromeStatusColors, "unconfigured">
> = {
  operational: "#22c55e",
  maintenance: "#f59e0b",
  offline: "#ef4444",
  checking: "#9ca3af",
};

/** Everything the row needs that is not generic. */
export interface FooterChromeConfig {
  /**
   * The legal entity the copyright line names. Empty hides the line - the
   * row never invents a holder.
   */
  copyrightHolder: string;
  /** Defaults to the current year, as rokct.ai's footer does. */
  copyrightYear?: number;
  /**
   * The version to advertise. `null` or empty hides the version string
   * rather than showing a made-up number.
   */
  version?: string | null;
  labels?: Partial<FooterChromeLabels>;
  statusColors?: FooterChromeStatusColors;
}

/**
 * The generic default: both product facts come from the environment, so a
 * shell that sets them gets the row with no code at all, and one that does
 * not gets the status indicator alone.
 */
export const FOOTER_CHROME_CONFIG: FooterChromeConfig = {
  copyrightHolder: process.env.NEXT_PUBLIC_COPYRIGHT_HOLDER ?? "",
  version: process.env.NEXT_PUBLIC_APP_VERSION ?? null,
};
