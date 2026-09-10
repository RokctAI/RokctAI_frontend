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

// The generated link-preview image, drawn at /opengraph-image from the copy
// the home SDK registered in components/custom/landing/site-metadata.ts:
// the registered logo (inlined as a data URI, SVG allowed), the site name
// large and the tagline under it on a dark neutral ground, in the default
// sans face next/og bundles - no font fetch, no filesystem read.
//
// With a registered `still` (Ray, 2026-09-09: the card shows a still from
// the app's guided tour, not only the wordmark) the card is two columns:
// the left 45% carries the logo - or the site name when there is no logo
// - the tagline and the host; the right 55% a phone, the still 372px wide
// inside a rounded bezel frame with a soft shadow, its top 72px under the
// card's top edge and the rest bleeding off the bottom. `stillAnchor:
// "top"` hangs the phone from the top edge instead (top bezel cut, its
// bottom 72px above the card's bottom edge) for a screen that is a bottom
// sheet. The still's size is read from its own header (PNG IHDR, JPEG SOF,
// WebP VP8/VP8L/VP8X), so it is drawn at its real aspect; satori (what
// next/og draws with) has flex, overflow: hidden, border-radius,
// box-shadow and <img> data URIs, which is all the phone needs.
//
// Next gives a file at this path priority over any config-based
// openGraph.images, so this route is what every card ends up pointing at.
// That is why it also honours a READY-MADE preview: when the copy's
// ogImage is a real raster (.png/.jpg/.jpeg/.webp) the route fetches it
// and answers with those bytes instead of drawing. Every fetch is
// best-effort: a logo that will not load leaves a text-only card, a still
// that will not load (or whose size cannot be read) leaves the
// single-column card, a ready-made preview that will not load falls back
// to the drawn one.
//
// The host printed on the card follows the REQUEST first (since 1.19.0,
// resolveDisplayHost in app/lib/site-metadata.ts): a white-label or
// custom domain in front of the same deployment prints its own host;
// a request host that is not a public one (localhost, 127.0.0.1, [::1],
// 0.0.0.0, anything ending .vercel.app, .local or .internal, or none -
// static generation, say) prints the configured site's host instead -
// NEXT_PUBLIC_SITE_URL, else the copy's `url` - and with neither the site
// name. Assets are unchanged: the request origin first, the configured
// site url only when there is no request.
//
// app/twitter-image.tsx re-exports this so both cards are one picture.

import { ImageResponse } from "next/og";
import { headers } from "next/headers";

import {
  isPreviewImage,
  resolveDisplayHost,
  resolveSiteUrl,
} from "@/app/lib/site-metadata";
import {
  loadSiteMetadata,
  type SiteMetadataCopy,
} from "@/components/custom/landing/site-metadata";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Link preview";

const FETCH_TIMEOUT_MS = 4000;

const TYPE_BY_EXTENSION: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

interface FetchedAsset {
  bytes: ArrayBuffer;
  type: string;
}

/**
 * The headers of the request being answered; undefined outside a request
 * (static generation, say), where `headers()` throws.
 */
async function requestHeaders(): Promise<Headers | undefined> {
  try {
    return await headers();
  } catch {
    return undefined;
  }
}

/**
 * The origin of the request being answered, from the forwarded headers or
 * the host header; undefined outside a request.
 */
function requestOrigin(h: Headers | undefined): string | undefined {
  if (!h) return undefined;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return undefined;
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

function guessType(path: string, fallback: string): string {
  const bare = path.split(/[?#]/, 1)[0].toLowerCase();
  const ext = Object.keys(TYPE_BY_EXTENSION).find((e) => bare.endsWith(e));
  return ext ? TYPE_BY_EXTENSION[ext] : fallback;
}

/** Fetches an asset by public path or absolute URL; null on any failure. */
async function fetchAsset(
  path: string,
  origin: string | undefined,
): Promise<FetchedAsset | null> {
  let url: URL;
  try {
    url = /^https?:\/\//i.test(path)
      ? new URL(path)
      : new URL(path, origin);
  } catch {
    return null;
  }
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const bytes = await res.arrayBuffer();
    if (bytes.byteLength === 0) return null;
    const header = res.headers.get("content-type")?.split(";", 1)[0].trim();
    const type =
      header && header.startsWith("image/")
        ? header
        : guessType(path, "image/png");
    return { bytes, type };
  } catch (error) {
    console.error(`[opengraph-image] could not fetch "${path}":`, error);
    return null;
  }
}

function toDataUri(asset: FetchedAsset): string {
  return `data:${asset.type};base64,${Buffer.from(asset.bytes).toString("base64")}`;
}

const LOGO_HEIGHT = 64;
const LOGO_MAX_WIDTH = 480;

/** A JPEG's width / height from its first SOFn segment; null when there is none. */
function jpegAspectRatio(view: DataView): number | null {
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return null;
  let pos = 2;
  while (pos + 4 <= view.byteLength) {
    if (view.getUint8(pos) !== 0xff) return null;
    const marker = view.getUint8(pos + 1);
    if (marker === 0xff) {
      pos += 1; // fill byte
      continue;
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      pos += 2; // standalone marker, no length
      continue;
    }
    const isSof =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) {
      if (pos + 9 > view.byteLength) return null;
      return view.getUint16(pos + 7) / view.getUint16(pos + 5);
    }
    if (marker === 0xd9 || marker === 0xda) return null; // EOI / SOS before any SOF
    pos += 2 + view.getUint16(pos + 2);
  }
  return null;
}

/** A WebP's width / height from its VP8X, VP8L or VP8 chunk; null when unreadable. */
function webpAspectRatio(view: DataView): number | null {
  if (view.byteLength < 30) return null;
  const fourcc = (at: number) =>
    String.fromCharCode(
      view.getUint8(at),
      view.getUint8(at + 1),
      view.getUint8(at + 2),
      view.getUint8(at + 3),
    );
  if (fourcc(0) !== "RIFF" || fourcc(8) !== "WEBP") return null;
  const chunk = fourcc(12);
  if (chunk === "VP8X") {
    const u24 = (at: number) =>
      view.getUint8(at) | (view.getUint8(at + 1) << 8) | (view.getUint8(at + 2) << 16);
    return (u24(24) + 1) / (u24(27) + 1);
  }
  if (chunk === "VP8L") {
    const bits = view.getUint32(21, true);
    return ((bits & 0x3fff) + 1) / (((bits >>> 14) & 0x3fff) + 1);
  }
  if (chunk === "VP8 ") {
    return (view.getUint16(26, true) & 0x3fff) / (view.getUint16(28, true) & 0x3fff);
  }
  return null;
}

/**
 * The asset's aspect ratio (width / height) from its own header - an SVG's
 * viewBox or width/height attributes, a PNG's IHDR, a JPEG's SOF, a WebP's
 * VP8/VP8L/VP8X chunk - or null when the header does not say.
 */
function readAspectRatio(asset: FetchedAsset): number | null {
  try {
    if (asset.type === "image/svg+xml") {
      const text = Buffer.from(asset.bytes).toString("utf8").slice(0, 4096);
      const viewBox = text.match(/viewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
      if (viewBox) return Number(viewBox[1]) / Number(viewBox[2]);
      const w = text.match(/<svg[^>]*\swidth\s*=\s*["']([\d.]+)/i);
      const h = text.match(/<svg[^>]*\sheight\s*=\s*["']([\d.]+)/i);
      if (w && h) return Number(w[1]) / Number(h[1]);
    } else if (asset.type === "image/png" && asset.bytes.byteLength >= 24) {
      const view = new DataView(asset.bytes);
      return view.getUint32(16) / view.getUint32(20);
    } else if (asset.type === "image/jpeg") {
      return jpegAspectRatio(new DataView(asset.bytes));
    } else if (asset.type === "image/webp") {
      return webpAspectRatio(new DataView(asset.bytes));
    }
  } catch {
    // fall through to unreadable
  }
  return null;
}

/**
 * The asset's aspect ratio so the mark can be drawn at LOGO_HEIGHT without
 * stretching. Anything unreadable is square.
 */
function aspectRatio(asset: FetchedAsset): number {
  return readAspectRatio(asset) ?? 1;
}

function logoBox(asset: FetchedAsset): { width: number; height: number } {
  const ratio = aspectRatio(asset);
  const width = Math.round(LOGO_HEIGHT * (Number.isFinite(ratio) && ratio > 0 ? ratio : 1));
  return { width: Math.min(width, LOGO_MAX_WIDTH), height: LOGO_HEIGHT };
}

// The two-column card with a still: the left column is 45% of the card,
// the phone sits centred in the remaining 55%. The frame is the bezel
// (STILL_BEZEL each side) around the still drawn STILL_WIDTH wide, its
// corners STILL_FRAME_RADIUS outside and STILL_FRAME_RADIUS - STILL_BEZEL
// inside, and STILL_INSET is the gap between the card edge the phone hangs
// from and the frame's near edge.
const LEFT_COLUMN_WIDTH = Math.round(size.width * 0.45);
const STILL_WIDTH = 372;
const STILL_BEZEL = 10;
const STILL_FRAME_RADIUS = 44;
const STILL_INSET = 72;

/**
 * The still drawn STILL_WIDTH wide at its own aspect; null when the header
 * does not give a usable size (the card then stays single-column rather
 * than guessing a shape for a phone).
 */
function stillBox(asset: FetchedAsset): { width: number; height: number } | null {
  const ratio = readAspectRatio(asset);
  if (ratio === null || !Number.isFinite(ratio) || ratio <= 0) return null;
  return { width: STILL_WIDTH, height: Math.round(STILL_WIDTH / ratio) };
}

export default async function OpenGraphImage() {
  const copy = await loadSiteMetadata();
  // Assets come from the server answering this request first - it is the
  // one that certainly serves its own public/ - and from the configured
  // site url only when there is no request (static generation). The host
  // printed on the card is the request's too when it is a public one (a
  // custom domain prints itself), else the configured site's.
  const configured = resolveSiteUrl(copy);
  const h = await requestHeaders();
  const request = requestOrigin(h);
  const origin = request ?? configured;
  const host = resolveDisplayHost(copy, h);

  if (isPreviewImage(copy.ogImage)) {
    const ready = await fetchAsset(copy.ogImage, origin);
    if (ready) {
      return new Response(ready.bytes, {
        headers: {
          "Content-Type": ready.type,
          "Cache-Control": "public, max-age=3600, s-maxage=86400",
        },
      });
    }
  }

  const siteName = copy.siteName || copy.title;
  const tagline = copy.tagline?.trim() ?? "";
  const logo = copy.logo ? await fetchAsset(copy.logo, origin) : null;
  const logoSrc = logo ? toDataUri(logo) : null;
  const logoSize = logo ? logoBox(logo) : null;
  const nameSize = siteName.length > 24 ? 72 : siteName.length > 14 ? 96 : 120;

  // A registered still is only a still when it is a raster this route can
  // size (same extension rule as ogImage); anything else, and any fetch or
  // header failure, keeps the single-column card below.
  const still = isPreviewImage(copy.still) ? await fetchAsset(copy.still, origin) : null;
  const stillSize = still ? stillBox(still) : null;

  if (still && stillSize) {
    const stillSrc = toDataUri(still);
    const frameWidth = stillSize.width + STILL_BEZEL * 2;
    const frameHeight = stillSize.height + STILL_BEZEL * 2;
    const rightColumnWidth = size.width - LEFT_COLUMN_WIDTH;
    const frameLeft = Math.round((rightColumnWidth - frameWidth) / 2);
    const framePosition =
      copy.stillAnchor === "top" ? { bottom: STILL_INSET } : { top: STILL_INSET };

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "row",
            backgroundColor: "#0b0b0b",
            backgroundImage:
              "radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0) 55%)",
            color: "#fafafa",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              width: LEFT_COLUMN_WIDTH,
              height: "100%",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "64px 0 56px 80px",
            }}
          >
            <div style={{ display: "flex", height: LOGO_HEIGHT, alignItems: "center" }}>
              {logoSrc && logoSize ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoSrc}
                  alt=""
                  width={logoSize.width}
                  height={logoSize.height}
                  style={{ width: logoSize.width, height: logoSize.height, objectFit: "contain" }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    fontSize: 56,
                    fontWeight: 700,
                    lineHeight: 1.02,
                    letterSpacing: -2,
                  }}
                >
                  {siteName}
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 38,
                fontWeight: 400,
                lineHeight: 1.3,
                color: "rgba(250, 250, 250, 0.72)",
                maxWidth: LEFT_COLUMN_WIDTH - 80 - 24,
              }}
            >
              {tagline}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 24,
                color: "rgba(250, 250, 250, 0.45)",
                letterSpacing: 1,
              }}
            >
              {host ?? ""}
            </div>
          </div>
          <div
            style={{
              width: rightColumnWidth,
              height: "100%",
              flexShrink: 0,
              display: "flex",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: frameLeft,
                ...framePosition,
                display: "flex",
                width: frameWidth,
                height: frameHeight,
                padding: STILL_BEZEL,
                borderRadius: STILL_FRAME_RADIUS,
                backgroundColor: "#1a1c1f",
                boxShadow: "0 30px 80px rgba(0, 0, 0, 0.6)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={stillSrc}
                alt=""
                width={stillSize.width}
                height={stillSize.height}
                style={{
                  width: stillSize.width,
                  height: stillSize.height,
                  borderRadius: STILL_FRAME_RADIUS - STILL_BEZEL,
                }}
              />
            </div>
          </div>
        </div>
      ),
      { ...size },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px 56px",
          backgroundColor: "#0b0b0b",
          backgroundImage:
            "radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0) 55%)",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", height: LOGO_HEIGHT }}>
          {logoSrc && logoSize ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoSrc}
              alt=""
              width={logoSize.width}
              height={logoSize.height}
              style={{ width: logoSize.width, height: logoSize.height, objectFit: "contain" }}
            />
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: nameSize,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: -3,
            }}
          >
            {siteName}
          </div>
          {tagline ? (
            <div
              style={{
                display: "flex",
                fontSize: 40,
                fontWeight: 400,
                lineHeight: 1.3,
                color: "rgba(250, 250, 250, 0.72)",
                maxWidth: 980,
              }}
            >
              {tagline}
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            fontSize: 24,
            color: "rgba(250, 250, 250, 0.45)",
            letterSpacing: 1,
          }}
        >
          {host ?? ""}
        </div>
      </div>
    ),
    { ...size },
  );
}
