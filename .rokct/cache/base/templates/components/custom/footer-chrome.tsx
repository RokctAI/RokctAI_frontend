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

"use client";

// The copyright row every rokct shell ends its page with: the copyright
// line on the left, the platform status indicator and the version string on
// the right. Generic chrome, not product content - the same row rokct.ai
// carries, here so each shell renders it instead of keeping a copy.
//
// Shell-agnostic by construction. No product name, no company, no brand
// colour: the copyright holder, the version and the words all arrive as
// config ([FooterChromeConfig]), and the only colours the markup names are
// neutral black/white alphas that sit on whatever ground the footer has.
// The status dot's three state colours are the deliberate exception and are
// overridable - see FOOTER_CHROME_STATUS_COLORS.
//
// Since 1.23.0 the row is also where the NETWORK STRIP lands by default
// (components/custom/network-strip.tsx: the other sites of the Rokct
// network, each a link, under "Trusted by"). It is drawn ABOVE the row,
// inside the same fragment, so every footer that already ends with this
// row shows the network minus itself with no edit; `networkStrip={false}`
// is for a footer that places the strip itself. Since 1.27.0 the strip
// renders once per page: on the landing route this footer surface yields
// whenever the home SDK's landing placement is not "none" (the page
// already carries the strip), and nothing here needs to know - the strip
// reads the route itself.
//
// Since 1.37.0 the row can also carry LINK GROUPS (`config.links`): a
// compact row of labelled links drawn between the strip and the
// copyright line - the seam a home SDK's footer fills with the shell's
// legal documents (components/custom/landing/legal-links.ts turns the
// published documents into that group, one link each to corporate_sdk's
// /legal/<name> page). Nothing is drawn when no group is passed.
//
// Since 1.41.0 the row can carry DOWNLOADS beside the link groups
// (`config.downloads`; Ray, 2026-09-11: "footer has  download links let
// them be platform icons buttons"): one ICON BUTTON per entry in a nav of
// its own - the mark base serves when the entry names one, else the
// platform's neutral glyph (components/custom/landing/platform-glyphs.tsx),
// the entry's label on the button's aria-label and title - and, first in
// that nav, the INSTALL OFFER (components/custom/install-offer.tsx; Ray,
// same day: "it should check the platform and offer app of that
// platform"), which reads the visitor's platform after mount and offers
// the download declared for it and, since 1.46.0, the browser's install
// prompt as an action beside it. Nothing is drawn when no download is
// declared. Since 1.46.0 the buttons are components/custom/download-buttons.tsx,
// which hides the one entry the offer already shows (Ray, 2026-09-11
// 20:33:16Z: "they become double when you tell user to download for that
// platform, i think should hide the normal one when showing the other")
// after mount - the server HTML still carries every icon.

import React from "react";
import Link from "next/link";

import { getPlatformStatus } from "@/app/actions/base/status";
import { DownloadButtons } from "@/components/custom/download-buttons";
import { InstallOffer } from "@/components/custom/install-offer";
import { NetworkStrip } from "@/components/custom/network-strip";
import { normaliseDownloads } from "@/components/custom/landing/download-platform";
import {
  FOOTER_CHROME_CONFIG,
  FOOTER_CHROME_LABELS,
  FOOTER_CHROME_STATUS_COLORS,
  type FooterChromeConfig,
  type PlatformStatus,
} from "@/components/custom/landing/footer-chrome-config";

export interface FooterChromeRowProps {
  /** Defaults to [FOOTER_CHROME_CONFIG], which reads the environment. */
  config?: FooterChromeConfig;
  /** Extra classes on the row itself, for the divider and spacing a footer wants. */
  className?: string;
  /**
   * Re-probe the status every N milliseconds. `0` (the default) probes once
   * on mount: the row is page chrome, and a marketing page is not a status
   * dashboard - rokct.ai's footer reads it once per render too.
   */
  refreshMs?: number;
  /**
   * Whether the network strip is drawn above the row (since 1.23.0).
   * Default true; the strip still draws only where the home SDK's
   * registered placement keeps `footer` on, and never lists this shell.
   */
  networkStrip?: boolean;
  /**
   * Whether the install offer is drawn first in the Downloads nav (since
   * 1.41.0). Default true; a footer whose shell mounts the offer
   * elsewhere (a header slot) passes false. Nothing is drawn either way
   * when `config.downloads` is empty.
   */
  installOffer?: boolean;
}

export function FooterChromeRow({
  config = FOOTER_CHROME_CONFIG,
  className = "",
  refreshMs = 0,
  networkStrip = true,
  installOffer = true,
}: FooterChromeRowProps) {
  const [status, setStatus] = React.useState<PlatformStatus | null>(null);

  React.useEffect(() => {
    let live = true;
    const probe = () => {
      getPlatformStatus()
        .then((next) => {
          if (live) setStatus(next);
        })
        .catch(() => {
          // The action itself failing tells us nothing about the platform,
          // so the indicator stays in its checking state rather than
          // reporting a failure the page cannot vouch for.
        });
    };
    probe();
    if (!refreshMs) return () => {
      live = false;
    };
    const timer = setInterval(probe, refreshMs);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [refreshMs]);

  const labels = { ...FOOTER_CHROME_LABELS, ...config.labels };
  const colors = { ...FOOTER_CHROME_STATUS_COLORS, ...config.statusColors };

  const groups = (config.links ?? []).filter((g) => g.items.length > 0);
  const downloads = normaliseDownloads(config.downloads);

  const year = config.copyrightYear ?? new Date().getFullYear();
  const holder = config.copyrightHolder?.trim();
  const version = config.version?.trim();

  // `null` is "still asking"; `unconfigured` is "nothing to ask", and the
  // row then carries no indicator at all rather than a dot with no meaning.
  const showStatus = status?.state !== "unconfigured";
  const state = status?.state;
  const dotColor =
    state === "operational"
      ? colors.operational
      : state === "maintenance"
        ? colors.maintenance
        : state === "offline"
          ? colors.offline
          : colors.checking;
  const stateLabel =
    state === "operational"
      ? labels.operational
      : state === "maintenance"
        ? labels.maintenance
        : state === "offline"
          ? labels.offline
          : labels.checking;

  return (
    <>
      {networkStrip && <NetworkStrip surface="footer" />}
      {(groups.length > 0 || downloads.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 pb-4">
          {groups.length > 0 && (
            <nav
              aria-label="Footer links"
              className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm"
            >
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1"
                  data-footer-group={group.id}
                >
                  <span className="text-xs font-bold uppercase tracking-tight opacity-50">
                    {group.label}
                  </span>
                  {group.items.map((item) =>
                    item.external ? (
                      <a
                        key={item.id}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-70 hover:opacity-100 underline-offset-4 hover:underline"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="opacity-70 hover:opacity-100 underline-offset-4 hover:underline"
                      >
                        {item.label}
                      </Link>
                    ),
                  )}
                </div>
              ))}
            </nav>
          )}
          {downloads.length > 0 && (
            <nav
              aria-label={labels.downloads}
              className="flex flex-wrap items-center gap-2"
              data-footer-downloads={downloads.length}
            >
              {installOffer && <InstallOffer downloads={downloads} className="mr-2" />}
              <DownloadButtons downloads={downloads} />
            </nav>
          )}
        </div>
      )}
      <div
        className={`flex flex-row justify-between items-center gap-6 ${className}`}
      >
        {holder ? (
          <p className="text-sm opacity-70">
            © Copyright {year} - {holder}
          </p>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-6">
          {showStatus && (
            <div
              className="flex items-center gap-2 px-2 py-1 md:px-3 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
              role="status"
              aria-live="polite"
            >
              <span
                aria-hidden="true"
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  backgroundColor: dotColor,
                  boxShadow:
                    state && state !== "unconfigured"
                      ? `0 0 8px ${dotColor}`
                      : undefined,
                }}
              />
              <span className="text-[10px] font-bold uppercase tracking-tight opacity-70">
                <span className="hidden md:inline">{labels.statusPrefix} </span>
                {stateLabel}
              </span>
            </div>
          )}
          {version && (
            <span className="hidden md:inline text-xs font-mono font-bold uppercase opacity-70">
              {labels.version} {version}
            </span>
          )}
        </div>
      </div>
    </>
  );
}

export default FooterChromeRow;
