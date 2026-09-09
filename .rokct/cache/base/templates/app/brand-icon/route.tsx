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

// The generated brand icon, drawn at /brand-icon: a square app tile with
// the first letter of the site's host on it. Ray, 2026-09-09: "on builds
// that dont have favicon like supacharge you can make it to take first
// letter of domain". It is a FALLBACK only - app/lib/site-metadata.ts
// points the shell's icon links here when the host ships no icon of its
// own (no app/favicon.ico, app/icon.*, app/apple-icon.png or
// public/favicon.ico) and the registered copy names no `icon`; a shell
// with a real icon never links to this route, though it still answers.
//
// GET /brand-icon?s=<px> answers a PNG, `s` square (16..512, default 64):
// the og card's #0b0b0b ground with the same top-right highlight, corners
// rounded 22% so it reads as an app tile at any size, the letter centred
// at about 62% of the square's height, in the sans face next/og bundles
// (regular is the only weight it ships, so fontWeight 700 is a wish
// satori grants only when a bolder face is available - no font fetch,
// same as the card). The letter is the first character of the site host
// - NEXT_PUBLIC_SITE_URL, else the copy's `url`, else the origin of the
// request being answered - with a leading "www." stripped and the
// character uppercased; when the host gives no letter or digit the site
// name's first character is used, and failing that "R".
//
// The letter is drawn in the shell's PRIMARY colour (Ray, 2026-09-09:
// "that letter should take color of primary color"), never a hard-coded
// brand: the registered `themeColor` when the copy names one; else the
// first `--primary:` declaration inside the `:root` block of the host's
// app/globals.css, read from disk once per process (the shadcn/Tailwind
// `H S% L%` triple, and hex, rgb()/rgba(), hsl()/hsla() and oklch() forms
// are all understood and normalised to hex, which is what satori draws);
// else white. A primary too dark to read on the ground (relative
// luminance under 0.18) keeps the letter and adds a thin ring of the same
// primary at 40% alpha around the tile so it still reads. Cached for a
// day: the letter changes only with the domain, the colour with a deploy.

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { resolveSiteUrl } from "@/app/lib/site-metadata";
import { loadSiteMetadata } from "@/components/custom/landing/site-metadata";

export const runtime = "nodejs";

/** The size drawn when `s` is absent or unreadable. */
const DEFAULT_ICON_SIZE = 64;
const MIN_ICON_SIZE = 16;
const MAX_ICON_SIZE = 512;

/** What the tile shows when neither the host nor the site name starts with a letter or digit. */
const FALLBACK_LETTER = "R";

/** The letter's colour when the copy names no themeColor and app/globals.css has no `--primary`. */
const FALLBACK_LETTER_COLOR = "#ffffff";

/** The tile's ground: the og card's. */
const GROUND = "#0b0b0b";

/** Below this relative luminance the primary gets a ring so the letter still reads on the ground. */
const LOW_CONTRAST_LUMINANCE = 0.18;

/** The ring's width at DEFAULT_ICON_SIZE; it scales with the tile. */
const RING_WIDTH = 2;

/** Where the host keeps its theme tokens, relative to the project root. */
const GLOBALS_CSS = "app/globals.css";

// Proportions of the square: the corner radius, and the font size that
// puts the capital's height (about 0.73em in the bundled face, measured
// at 512px) near 62% of the tile. Flex centring with lineHeight 1 lands
// the capital's optical centre on the tile's within a pixel, so there is
// no nudge.
const CORNER_RATIO = 0.22;
const FONT_RATIO = 0.84;

/** The requested square, clamped to 16..512; DEFAULT_ICON_SIZE when `s` is not a number. */
function parseIconSize(raw: string | null): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n)) return DEFAULT_ICON_SIZE;
  return Math.min(MAX_ICON_SIZE, Math.max(MIN_ICON_SIZE, n));
}

/** The host of a URL or origin with any leading "www." removed; null when it is not a URL. */
function hostOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return null;
  }
}

/** The first letter or digit of `text`, uppercased; null when there is none. */
function firstGlyph(text: string | null | undefined): string | null {
  if (!text) return null;
  const match = text.match(/[\p{L}\p{N}]/u);
  return match ? match[0].toUpperCase() : null;
}

/**
 * The letter the tile carries: the site host's first letter, else the
 * request host's, else the site name's, else FALLBACK_LETTER.
 */
function pickLetter(
  siteHost: string | null,
  requestHost: string | null,
  siteName: string | undefined,
): string {
  return (
    firstGlyph(siteHost) ??
    firstGlyph(requestHost) ??
    firstGlyph(siteName) ??
    FALLBACK_LETTER
  );
}

// ---- colour ------------------------------------------------------------

type Rgb = [number, number, number];

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function hslToRgb(h: number, s: number, l: number): Rgb {
  const hue = (((h % 360) + 360) % 360) / 360;
  const sat = clamp01(s);
  const light = clamp01(l);
  if (sat === 0) return [light, light, light];
  const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
  const p = 2 * light - q;
  const channel = (t0: number) => {
    const t = ((t0 % 1) + 1) % 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [channel(hue + 1 / 3), channel(hue), channel(hue - 1 / 3)];
}

/** oklch(L C H) to linear-light sRGB, clipped to the gamut. */
function oklchToRgb(l: number, c: number, h: number): Rgb {
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;
  const l3 = l_ ** 3;
  const m3 = m_ ** 3;
  const s3 = s_ ** 3;
  const lin: Rgb = [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ];
  const gamma = (v: number) => {
    const x = clamp01(v);
    return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
  };
  return [gamma(lin[0]), gamma(lin[1]), gamma(lin[2])];
}

/** A number token, `%` meaning a fraction of `scale`. */
function num(token: string, scale = 1): number | null {
  const t = token.trim();
  if (!t) return null;
  const pct = t.endsWith("%");
  const n = Number.parseFloat(pct ? t.slice(0, -1) : t);
  if (!Number.isFinite(n)) return null;
  return pct ? (n / 100) * scale : n;
}

/**
 * A CSS colour as sRGB fractions, or null when the form is not one this
 * route reads: `#rgb`, `#rrggbb` (an alpha digit pair is ignored),
 * `rgb()`/`rgba()`, `hsl()`/`hsla()`, `oklch()`, and the bare shadcn
 * `H S% L%` triple app/globals.css tokens are written in.
 */
function parseColor(input: string): Rgb | null {
  const text = input.trim();
  const hex = text.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let d = hex[1];
    if (d.length === 3 || d.length === 4) d = [...d].map((ch) => ch + ch).join("");
    if (d.length !== 6 && d.length !== 8) return null;
    return [0, 2, 4].map((i) => Number.parseInt(d.slice(i, i + 2), 16) / 255) as Rgb;
  }
  const fn = text.match(/^(rgba?|hsla?|oklch)\(([^)]*)\)$/i);
  const parts = (fn ? fn[2] : text)
    .split("/")[0]
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean);
  if (parts.length < 3) return null;
  const kind = fn ? fn[1].toLowerCase() : "bare";
  if (kind === "rgb" || kind === "rgba") {
    const c = parts.slice(0, 3).map((t) => num(t, 255));
    if (c.some((v) => v === null)) return null;
    return c.map((v) => clamp01((v as number) / 255)) as Rgb;
  }
  if (kind === "oklch") {
    const l = num(parts[0]);
    const c = num(parts[1], 0.4);
    const h = num(parts[2], 360);
    if (l === null || c === null || h === null) return null;
    return oklchToRgb(l, c, h);
  }
  // hsl(), hsla() and the bare triple: hue, then saturation and lightness as percentages.
  if (kind === "bare" && !/%/.test(text)) return null;
  const h = num(parts[0].replace(/deg$/i, ""), 360);
  const s = num(parts[1]);
  const l = num(parts[2]);
  if (h === null || s === null || l === null) return null;
  return hslToRgb(h, s, l);
}

function toHex(rgb: Rgb): string {
  return `#${rgb
    .map((v) => Math.round(clamp01(v) * 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

/** WCAG relative luminance of an sRGB colour, 0 (black) to 1 (white). */
function luminance(rgb: Rgb): number {
  const lin = rgb.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

/** The first `--primary:` value inside the `:root` block of a stylesheet, or null. */
function rootPrimaryOf(css: string): string | null {
  const rootAt = css.search(/:root\s*\{/);
  if (rootAt < 0) return null;
  const open = css.indexOf("{", rootAt);
  const close = css.indexOf("}", open);
  const block = css.slice(open + 1, close < 0 ? undefined : close);
  const decl = block.match(/--primary\s*:\s*([^;}]+)/);
  return decl ? decl[1].trim() : null;
}

let cachedGlobalsPrimary: Rgb | null | undefined;

/**
 * The host's `--primary` token from app/globals.css, read once per
 * process; null when there is no file, no `:root` primary or the value
 * is in a form parseColor does not read.
 */
async function globalsPrimary(): Promise<Rgb | null> {
  if (cachedGlobalsPrimary !== undefined) return cachedGlobalsPrimary;
  let found: Rgb | null = null;
  try {
    const [{ readFile }, { join }] = await Promise.all([
      import("node:fs/promises"),
      import("node:path"),
    ]);
    const css = await readFile(join(process.cwd(), GLOBALS_CSS), "utf8");
    const raw = rootPrimaryOf(css);
    found = raw ? parseColor(raw) : null;
  } catch {
    found = null;
  }
  cachedGlobalsPrimary = found;
  return found;
}

/** The letter's colour: the registered themeColor, else the host's `--primary`, else white. */
async function resolvePrimary(themeColor: string | undefined): Promise<Rgb> {
  const registered = themeColor?.trim() ? parseColor(themeColor) : null;
  if (registered) return registered;
  if (themeColor?.trim()) {
    console.error(`[brand-icon] themeColor "${themeColor}" is not a colour this route reads; using --primary`);
  }
  return (await globalsPrimary()) ?? (parseColor(FALLBACK_LETTER_COLOR) as Rgb);
}

/** The origin the request came in on, from the forwarded headers or the host header. */
function requestOrigin(request: NextRequest): string | undefined {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return undefined;
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function GET(request: NextRequest) {
  const size = parseIconSize(request.nextUrl.searchParams.get("s"));
  const copy = await loadSiteMetadata();
  const letter = pickLetter(
    hostOf(resolveSiteUrl(copy)),
    hostOf(requestOrigin(request)),
    copy.siteName || copy.title,
  );

  const primary = await resolvePrimary(copy.themeColor);
  const letterColor = toHex(primary);
  const lowContrast = luminance(primary) < LOW_CONTRAST_LUMINANCE;

  const radius = Math.round(size * CORNER_RATIO);
  const fontSize = Math.round(size * FONT_RATIO);
  const ring = Math.max(RING_WIDTH, Math.round((size / DEFAULT_ICON_SIZE) * RING_WIDTH));
  const [r, g, b] = primary.map((v) => Math.round(v * 255));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: radius,
          backgroundColor: GROUND,
          backgroundImage:
            "radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0) 55%)",
          ...(lowContrast
            ? { border: `${ring}px solid rgba(${r}, ${g}, ${b}, 0.4)` }
            : {}),
          color: letterColor,
          fontFamily: "sans-serif",
          fontSize,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {letter}
      </div>
    ),
    {
      width: size,
      height: size,
      headers: {
        "Cache-Control": "public, max-age=86400",
      },
    },
  );
}
