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

import React from "react";

import { getPlatformStatus } from "@/app/actions/base/status";
import { NetworkStrip } from "@/components/custom/network-strip";
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
}

export function FooterChromeRow({
  config = FOOTER_CHROME_CONFIG,
  className = "",
  refreshMs = 0,
  networkStrip = true,
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
