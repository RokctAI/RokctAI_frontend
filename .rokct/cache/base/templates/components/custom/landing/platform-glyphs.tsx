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

// The neutral platform glyphs (since 1.41.0) a download button draws when
// its entry names no mark, and the button's shared drawing. Four plain
// shapes - a phone, a laptop, a terminal, a globe - in `currentColor`, so
// they take the button's text colour in both themes; NO third-party
// brand mark is drawn by hand here (the marks base serves, brand-marks.ts,
// are the files their owners publish, and an entry names one by key).

import React from "react";
import Image from "next/image";

import {
  BRAND_MARKS,
  markImageClass,
} from "@/components/custom/landing/brand-marks";
import type {
  DownloadEntry,
  DownloadPlatform,
} from "@/components/custom/landing/footer-chrome-config";

/** The shapes; each platform maps to one. */
export type PlatformGlyphShape = "phone" | "laptop" | "terminal" | "globe";

/** Which shape stands for each platform when no mark is named. */
export const PLATFORM_GLYPH_SHAPES: Readonly<Record<DownloadPlatform, PlatformGlyphShape>> = {
  ios: "phone",
  android: "phone",
  huawei: "phone",
  macos: "laptop",
  windows: "laptop",
  linux: "terminal",
  web: "globe",
};

/**
 * The button every download draws as: a 40px circle with the theme's
 * border, transparent, tinted on hover - the same in the footer row and
 * in the install offer, so the two read as one set.
 */
export const DOWNLOAD_BUTTON_CLASS =
  "h-10 w-10 rounded-full border border-border bg-transparent hover:bg-muted flex items-center justify-center";

/** The size of the mark or glyph inside the button. */
export const DOWNLOAD_ICON_CLASS = "h-5 w-5 shrink-0";

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** One neutral glyph, 24x24, stroked in `currentColor`. */
export function PlatformGlyph({
  shape,
  className = DOWNLOAD_ICON_CLASS,
}: {
  shape: PlatformGlyphShape;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className={className}
      data-platform-glyph={shape}
      {...STROKE}
    >
      {shape === "phone" && (
        <>
          <rect x="7" y="2.5" width="10" height="19" rx="2" />
          <path d="M11 18.5h2" />
        </>
      )}
      {shape === "laptop" && (
        <>
          <rect x="4" y="5" width="16" height="11" rx="1.5" />
          <path d="M2 19h20" />
        </>
      )}
      {shape === "terminal" && (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M7 9l3 3-3 3M12 15h5" />
        </>
      )}
      {shape === "globe" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </>
      )}
    </svg>
  );
}

/**
 * What a download button shows: the mark the entry names, when
 * BRAND_MARKS has it (a monochrome one inverted on the dark shell -
 * markImageClass, keyed on the src), else the platform's glyph. The image
 * is decorative - the button's aria-label carries the words - and served
 * as it is, an SVG the shell hosts itself.
 */
export function DownloadMark({
  entry,
  className = DOWNLOAD_ICON_CLASS,
}: {
  entry: DownloadEntry;
  className?: string;
}) {
  const mark = entry.mark ? BRAND_MARKS[entry.mark] : undefined;
  if (mark) {
    const mono = markImageClass(mark.src);
    return (
      <Image
        src={mark.src}
        alt=""
        width={20}
        height={20}
        unoptimized
        className={mono ? `${className} object-contain ${mono}` : `${className} object-contain`}
      />
    );
  }
  return <PlatformGlyph shape={PLATFORM_GLYPH_SHAPES[entry.platform]} className={className} />;
}
