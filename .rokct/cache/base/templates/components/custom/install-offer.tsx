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
// ONE icon button and "Get the <label>" linking there. A page already
// installed (the `display-mode: standalone` media query matches) draws
// nothing.
//
// Since 1.46.0 the browser's install prompt is a REAL ACTION beside that
// link, not a fallback for it. Ray, 2026-09-11 20:35:38Z: "nextjs no
// longer offering me to install app like it used to with pwa"; 20:46:43Z:
// "the install offer used to show its not showing, that bottom offer is
// not really an offer its attention, no clicking icon on browser and it
// try to install or it popup and install". The 1.41.0 offer listened for
// `beforeinstallprompt` only when NO download matched the platform, and
// only from a second effect after the platform was read - so a page with
// a matching entry never offered the install, and elsewhere an event
// that fired before that effect was missed while a later one was
// swallowed by preventDefault() with no control to show for it. Now:
//
// 1. The FIRST effect on mount, before any platform read, listens for
//    `beforeinstallprompt` and `appinstalled`. The event is stashed and
//    stays stashed until the visitor acts; `appinstalled` drops it.
// 2. `preventDefault()` runs only when our Install control will render -
//    a page running installed leaves the browser's own banner alone.
// 3. The Install control renders only once an event is stashed; a click
//    calls `event.prompt()`, awaits `userChoice`, then clears the stash
//    (the browser may fire the event again later; it is stashed again).
// 4. With a matching download the offer draws BOTH: "Get the <label>"
//    and, when an event is stashed, Install.
// 5. The offer publishes the id of the entry it shows to OFFERED_DOWNLOAD
//    so the icon row (components/custom/download-buttons.tsx) hides that
//    platform's duplicate button (Ray, 20:33:16Z: "they become double when
//    you tell user to download for that platform, i think should hide the
//    normal one when showing the other").
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
  OFFERED_DOWNLOAD,
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
  OFFERED_DOWNLOAD,
  createOfferedDownloadStore,
  detectPlatform,
  detectPlatformFrom,
  installOfferText,
  pickDownload,
  visibleDownloads,
} from "@/components/custom/landing/install-offer";

/** The `beforeinstallprompt` event, which the DOM lib does not type. */
export interface BeforeInstallPromptEvent extends Event {
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
  /** Extra classes on the offer's link and button. */
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
  // The stashed `beforeinstallprompt`, kept until the visitor acts on it.
  const [prompt, setPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  // What the listener reads at event time: whether our control may render
  // (an installed page gets none) and whether a prompt is already showing.
  const offerable = React.useRef(true);
  const showing = React.useRef(false);

  React.useEffect(() => {
    // Attached FIRST, before the platform is read, so an event that fires
    // as soon as the page is eligible is caught; it stays attached, so a
    // later event (after a dismissal) is stashed again.
    const onPrompt = (event: Event) => {
      if (!offerable.current) return;
      event.preventDefault();
      setPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  React.useEffect(() => {
    const installed =
      typeof window.matchMedia === "function" && window.matchMedia(STANDALONE_MEDIA_QUERY).matches;
    offerable.current = !installed;
    setStandalone(installed);
    setPlatform(forced === undefined ? detectPlatform() : forced);
  }, [forced]);

  const entry = platform ? pickDownload(downloads, platform) : null;
  const offeredId = platform !== undefined && !standalone && entry ? entry.id : null;

  React.useEffect(() => {
    // Tell the icon row which entry this offer already shows.
    OFFERED_DOWNLOAD.set(offeredId);
    return () => {
      OFFERED_DOWNLOAD.set(null);
    };
  }, [offeredId]);

  if (platform === undefined || standalone) return null;

  const words = { ...INSTALL_OFFER_LABELS, ...labels };

  const install = async () => {
    const event = prompt;
    if (!event || showing.current) return;
    showing.current = true;
    try {
      await event.prompt();
      await event.userChoice;
    } catch {
      // The browser refused to show it (again); the stash is cleared below
      // and a fresh event, if one comes, is stashed anew.
    } finally {
      showing.current = false;
      setPrompt(null);
    }
  };

  return (
    <>
      {entry && (
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
          <span>{installOfferText(entry, words)}</span>
        </a>
      )}
      {prompt && (
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
      )}
    </>
  );
}

export default InstallOffer;
