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
//
// Since 1.41.0 the row can also carry DOWNLOADS (`downloads`): one icon
// button per platform the shell has an app for, declared by the home SDK
// as [DownloadEntry] rows - nothing here names a store, a platform's
// wording or a link; the platform marks base serves (brand-marks.ts) are
// keyed by name, and everything else is a neutral glyph.

import type { BrandMarkId } from "@/components/custom/landing/brand-marks";

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
 * The probes a deployment can name - the CATALOGUE, not the default order.
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
 *    (control hooks `control:get_versions`), also `allow_guest=True`. A
 *    control site accepts only `control:`-prefixed cmds, hence the prefix.
 *
 * Which of them run, and in what order, is [DEFAULT_PLATFORM_STATUS_SOURCES]
 * unless `ROKCT_STATUS_SOURCE` names its own list
 * ([resolvePlatformStatusProbes]).
 */
export const PLATFORM_STATUS_PROBES: readonly PlatformStatusProbe[] = [
  { site: "tenant", cmd: "api.system.api_status" },
  { site: "control", cmd: "control:get_versions" },
];

/**
 * The sites probed when `ROKCT_STATUS_SOURCE` is unset: THE TENANT ONLY
 * (since 1.37.0).
 *
 * Ray, 2026-09-09: every shell reads its footer status from its own
 * tenant backend, never from control. Until 1.33.0 the default list fell
 * back to the control probe, which stayed harmless only because a shell
 * with no control variable pointed that probe at its tenant URL too. Now
 * control is OPT-IN: a deployment that wants it names it explicitly -
 * `ROKCT_STATUS_SOURCE=control` for a control-plane shell,
 * `ROKCT_STATUS_SOURCE=tenant,control` to keep control as a fallback -
 * and the variable names are unchanged.
 */
export const DEFAULT_PLATFORM_STATUS_SOURCES: readonly PlatformStatusSite[] = [
  "tenant",
];

/**
 * The probes to run, from a comma-separated list of sites - the value of
 * `ROKCT_STATUS_SOURCE`. Unset (or nothing recognised) runs
 * [DEFAULT_PLATFORM_STATUS_SOURCES] - the tenant only; `off` runs
 * nothing, so the indicator reports `unconfigured` and the row hides it.
 *
 * Configured rather than hard-coded so "which site answers for status" can
 * be flipped per deployment - `ROKCT_STATUS_SOURCE=control` pins a shell to
 * the control plane, `tenant` (the default) pins it to its own backend,
 * `tenant,control` probes both in that order - without another SDK
 * release. Named order wins, and a site named twice is probed once.
 */
export function resolvePlatformStatusProbes(
  source?: string | null,
): PlatformStatusProbe[] {
  const raw = (source ?? "").trim().toLowerCase();
  if (raw === "off" || raw === "none") return [];

  const wanted = raw
    .split(",")
    .map((part) => part.trim())
    .filter((part): part is PlatformStatusSite =>
      part === "tenant" || part === "control",
    );
  if (wanted.length === 0) return probesFor(DEFAULT_PLATFORM_STATUS_SOURCES);
  return probesFor(wanted);
}

/** The catalogue entries for the named sites, in the order named, once each. */
function probesFor(sites: readonly PlatformStatusSite[]): PlatformStatusProbe[] {

  const seen = new Set<PlatformStatusSite>();
  const probes: PlatformStatusProbe[] = [];
  for (const site of sites) {
    if (seen.has(site)) continue;
    seen.add(site);
    const probe = PLATFORM_STATUS_PROBES.find((p) => p.site === site);
    if (probe) probes.push(probe);
  }
  return probes;
}

/**
 * The ONE registered tenant cmd that carries the platform's version
 * (1.40.0): base_sdk's own `api.system.api_status`
 * (`{app_name}.api.system.api_status` in base/frappe/manifest.json),
 * answering `{data: {status, version, user}}`. The admin system-info
 * actions (app/actions/base/admin/settings.ts and system.ts) asked
 * `api.get_version`, a cmd registered nowhere - not in base's frappe
 * manifest, not in the platform's hooks - so the version always came back
 * null; they now ask this cmd and read it with [readPlatformVersion].
 */
export const PLATFORM_VERSION_CMD = "api.system.api_status";

/**
 * The version out of whatever a probe or the version cmd answered: the
 * base_sdk envelope `{data: {version}}`, the gateway's `message` wrapper
 * around it, or a bare `{version}`; `null` unless the field is a string.
 */
export function readPlatformVersion(answer: unknown): string | null {
  if (answer === null || typeof answer !== "object") return null;
  const body = answer as Record<string, unknown>;
  const message = body.message;
  const unwrapped =
    message !== null && typeof message === "object" && !Array.isArray(message)
      ? (message as Record<string, unknown>)
      : body;
  const data = unwrapped.data;
  const inner =
    data !== null && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : unwrapped;
  return typeof inner.version === "string" ? inner.version : null;
}

/**
 * Whether what a probe answered with counts as an answer (1.40.0): a
 * plain object with at least one field. A 2xx that resolves to `null`,
 * `undefined`, a scalar, an array or `{}` is a proxy or an empty page
 * standing where the backend should be - it says nothing about the
 * platform, so `getPlatformStatus` treats it as no answer and falls
 * through to the next probe, then to `offline`. The gateway's own
 * `message` envelope is looked through: `platformCall` hands back
 * `data.message || data`, so a body of `{"message": null}` arrives as the
 * envelope itself, and an envelope whose only field is an empty `message`
 * is exactly as empty as `null`.
 */
export function isProbeAnswer(answer: unknown): answer is Record<string, unknown> {
  if (answer === null || typeof answer !== "object" || Array.isArray(answer)) return false;
  const keys = Object.keys(answer);
  if (keys.length === 0) return false;
  if (keys.length === 1 && keys[0] === "message") {
    return isProbeAnswer((answer as Record<string, unknown>).message);
  }
  return true;
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
  /** The accessible name of the download buttons' nav (since 1.41.0). */
  downloads: string;
}

export const FOOTER_CHROME_LABELS: FooterChromeLabels = {
  statusPrefix: "System",
  operational: "Online",
  maintenance: "Maintenance",
  offline: "Offline",
  checking: "Checking",
  version: "Version",
  downloads: "Downloads",
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

/**
 * One link a footer group carries (since 1.37.0). `label` is the word on
 * screen, already in the shell's language - the same rule as
 * HeaderMenuLink: this module never reaches for an i18n dictionary.
 */
export interface FooterLink {
  /** Stable key for the list. */
  id: string;
  label: string;
  href: string;
  /** Open in a new tab with rel="noopener noreferrer". */
  external?: boolean;
}

/**
 * One labelled group of footer links (since 1.37.0) - the seam a home SDK
 * fills to put a compact link row above the copyright line: its legal
 * documents (components/custom/landing/legal-links.ts builds that group
 * from the published documents), or whatever else its footer wants there.
 * A group with no items draws nothing.
 */
export interface FooterLinkGroup {
  id: string;
  /** The group's heading word, drawn before its links. */
  label: string;
  items: FooterLink[];
}

/**
 * The platforms a download can be for (since 1.41.0). The closed set the
 * install offer (components/custom/landing/install-offer.ts) detects
 * against, and the key of the neutral glyph a button falls back to
 * (components/custom/landing/platform-glyphs.tsx) when its entry names
 * no mark.
 */
export type DownloadPlatform =
  | "ios"
  | "android"
  | "huawei"
  | "macos"
  | "windows"
  | "linux"
  | "web";

/**
 * One download a shell offers (since 1.41.0). Ray, 2026-09-11: "footer
 * has download links let them be platform icons buttons" - so each entry
 * is drawn as ONE icon button, its `label` on the button's aria-label
 * and title (the word on screen for a reader, already in the shell's
 * language, the FooterLink rule), never as a text link. `mark` names one
 * of the marks base serves itself (BRAND_MARKS: googlePlay, appGallery,
 * appStore, windows, chromeWebStore); with none named the button draws
 * the platform's neutral glyph. `href` is an https URL or a route of the
 * shell's own (download-platform.ts holds the rule).
 */
export interface DownloadEntry {
  /** Stable key for the list. */
  id: string;
  platform: DownloadPlatform;
  /** What the button is called: "Android app", "Chrome extension". */
  label: string;
  href: string;
  /** Open in a new tab with rel="noreferrer". */
  external?: boolean;
  /** The button's title when it is not the label. */
  title?: string;
  /** A mark base serves under /brand/marks/, by its BRAND_MARKS key. */
  mark?: BrandMarkId;
}

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
  /**
   * Link groups drawn as one compact row above the copyright line (since
   * 1.37.0). Absent or empty draws nothing - a shell that has not opted in
   * renders exactly the row it rendered before.
   */
  links?: FooterLinkGroup[];
  /**
   * The shell's downloads, one icon button each, drawn beside the link
   * groups (since 1.41.0), and what the install offer picks from. Absent
   * or empty draws nothing.
   */
  downloads?: DownloadEntry[];
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
