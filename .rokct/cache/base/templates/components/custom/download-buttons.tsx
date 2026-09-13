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

// The footer's download icon buttons (since 1.41.0: Ray, 2026-09-11:
// "footer has  download links let them be platform icons buttons"), one
// per declared entry, moved out of components/custom/footer-chrome.tsx in
// 1.46.0 so the row can HIDE THE DUPLICATE. Ray, 2026-09-11 20:33:16Z:
// "they become double when you tell user to download for that platform,
// i think should hide the normal one when showing the other". The
// install offer (components/custom/install-offer.tsx) publishes the id of
// the entry it is showing to OFFERED_DOWNLOAD after mount; this row reads
// it through React.useSyncExternalStore - the server snapshot is always
// `null` - and drops that one entry (visibleDownloads). So the server
// HTML and the first client render carry EVERY icon (no window read at
// render), and the one the offer already draws goes after mount. With no
// offer mounted, no platform recognised, or an installed page, nothing is
// hidden. The row itself is unchanged: the same <a>, class, aria-label,
// title and mark as 1.41.0.

import React from "react";

import type { DownloadEntry } from "@/components/custom/landing/footer-chrome-config";
import { downloadTitle } from "@/components/custom/landing/download-platform";
import { OFFERED_DOWNLOAD, visibleDownloads } from "@/components/custom/landing/install-offer";
import {
  DOWNLOAD_BUTTON_CLASS,
  DownloadMark,
} from "@/components/custom/landing/platform-glyphs";

export interface DownloadButtonsProps {
  /** The drawable entries, in declared order - the row's normalised `config.downloads`. */
  downloads: DownloadEntry[];
  /**
   * Hide the entry the install offer is showing (the default). `false`
   * draws every entry whatever the offer shows.
   */
  hideOffered?: boolean;
}

const serverSnapshot = () => null;

/** The id of the entry the install offer shows, `null` on the server and before the offer mounts. */
export function useOfferedDownload(): string | null {
  return React.useSyncExternalStore(OFFERED_DOWNLOAD.subscribe, OFFERED_DOWNLOAD.get, serverSnapshot);
}

export function DownloadButtons({ downloads, hideOffered = true }: DownloadButtonsProps) {
  const offeredId = useOfferedDownload();
  const entries = visibleDownloads(downloads, hideOffered ? offeredId : null);
  return (
    <>
      {entries.map((entry) => (
        <a
          key={entry.id}
          href={entry.href}
          target={entry.external ? "_blank" : undefined}
          rel={entry.external ? "noreferrer" : undefined}
          aria-label={entry.label}
          title={downloadTitle(entry)}
          data-download-platform={entry.platform}
          className={DOWNLOAD_BUTTON_CLASS}
        >
          <DownloadMark entry={entry} />
        </a>
      ))}
    </>
  );
}

export default DownloadButtons;
