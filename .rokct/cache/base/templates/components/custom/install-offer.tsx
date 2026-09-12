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

// The install offer (since 1.41.0). Ray, 2026-09-11: "this nextjs has
// install, it does show on mobile though i havent seen it in desktop i
// think it installs as pwa but i think it should check the platform and
// offer app of that platform". So the offer reads the platform the
// visitor is on AFTER mount (components/custom/landing/install-offer.ts
// detectPlatform: client hints, then the user-agent string) and, when the
// shell declared a download for it (pickDownload over `downloads`), draws
// ONE icon button and "Get the <label>" linking there; with none declared
// for the platform it listens for the browser's `beforeinstallprompt`,
// keeps the event, and draws "Install" which shows that prompt; with
// neither it draws nothing. A page already installed (the
// `display-mode: standalone` media query matches) draws nothing either.
//
// The server renders NOTHING for it (there is no navigator to read), and
// so does the first client render: everything is read in an effect, so
// the two agree. Shell-agnostic: the entries, the words and the platform
// marks all arrive as props or by key; the only defaults are the two
// words in INSTALL_OFFER_LABELS.
//
// components/custom/footer-chrome.tsx mounts it first in the row's
// Downloads nav; a home SDK may mount it anywhere else (a header slot)
// with the same `downloads`, and pass `installOffer={false}` to the row.

import React from "react";

import type {
  DownloadEntry,
  DownloadPlatform,
} from "@/components/custom/landing/footer-chrome-config";
import {
  INSTALL_OFFER_LABELS,
  STANDALONE_MEDIA_QUERY,
  detectPlatform,
  installOfferText,
  pickDownload,
  type InstallOfferLabels,
} from "@/components/custom/landing/install-offer";
import {
  DOWNLOAD_BUTTON_CLASS,
  DownloadMark,
  PlatformGlyph,
} from "@/components/custom/landing/platform-glyphs";

export {
  DOWNLOAD_FALLBACKS,
  INSTALL_OFFER_LABELS,
  detectPlatform,
  detectPlatformFrom,
  installOfferText,
  pickDownload,
} from "@/components/custom/landing/install-offer";

/** The `beforeinstallprompt` event, which the DOM lib does not type. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface InstallOfferProps {
  /** The shell's downloads - the row's `config.downloads`. */
  downloads: DownloadEntry[];
  labels?: Partial<InstallOfferLabels>;
  /**
   * The platform to offer for, instead of reading the browser's: for a
   * preview or a test. `null` reads as "none recognised".
   */
  platform?: DownloadPlatform | null;
  /** Extra classes on the offer's link or button. */
  className?: string;
}

/** The link and button the offer draws: the icon button and the words beside it. */
const OFFER_CLASS = "inline-flex items-center gap-3 text-sm opacity-80 hover:opacity-100";

export function InstallOffer({
  downloads,
  labels,
  platform: forced,
  className = "",
}: InstallOfferProps) {
  // `undefined` until mounted - the server and the first client render
  // draw nothing; afterwards the detected (or forced) platform or null.
  const [platform, setPlatform] = React.useState<DownloadPlatform | null | undefined>(undefined);
  const [standalone, setStandalone] = React.useState(false);
  const [prompt, setPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);

  React.useEffect(() => {
    setStandalone(
      typeof window.matchMedia === "function" && window.matchMedia(STANDALONE_MEDIA_QUERY).matches,
    );
    setPlatform(forced === undefined ? detectPlatform() : forced);
  }, [forced]);

  const entry = platform ? pickDownload(downloads, platform) : null;
  const hasEntry = entry !== null;

  React.useEffect(() => {
    // The browser's own prompt is the fallback: listened for only when no
    // declared download serves this platform, and only until it fires.
    if (platform === undefined || hasEntry) return;
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, [platform, hasEntry]);

  if (platform === undefined || standalone) return null;

  const words = { ...INSTALL_OFFER_LABELS, ...labels };

  if (entry) {
    const text = installOfferText(entry, words);
    return (
      <a
        href={entry.href}
        target={entry.external ? "_blank" : undefined}
        rel={entry.external ? "noreferrer" : undefined}
        className={`${OFFER_CLASS} ${className}`}
        data-install-offer={entry.platform}
      >
        <span className={DOWNLOAD_BUTTON_CLASS} aria-hidden="true">
          <DownloadMark entry={entry} />
        </span>
        <span>{text}</span>
      </a>
    );
  }

  if (prompt) {
    const install = () => {
      const pending = prompt;
      setPrompt(null);
      pending.prompt().catch(() => {
        // The browser refused to show it again; the offer stays gone.
      });
    };
    return (
      <button
        type="button"
        onClick={install}
        className={`${OFFER_CLASS} ${className}`}
        data-install-offer="prompt"
      >
        <span className={DOWNLOAD_BUTTON_CLASS} aria-hidden="true">
          <PlatformGlyph shape="globe" />
        </span>
        <span>{words.install}</span>
      </button>
    );
  }

  return null;
}

export default InstallOffer;
