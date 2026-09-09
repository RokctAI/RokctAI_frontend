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
// Next gives a file at this path priority over any config-based
// openGraph.images, so this route is what every card ends up pointing at.
// That is why it also honours a READY-MADE preview: when the copy's
// ogImage is a real raster (.png/.jpg/.jpeg/.webp) the route fetches it
// and answers with those bytes instead of drawing. Every fetch is
// best-effort: a logo that will not load leaves a text-only card, a
// ready-made preview that will not load falls back to the drawn one.
//
// app/twitter-image.tsx re-exports this so both cards are one picture.

import { ImageResponse } from "next/og";
import { headers } from "next/headers";

import {
  isPreviewImage,
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
 * The origin of the request being answered, from the forwarded headers or
 * the host header; undefined outside a request (static generation, say).
 */
async function requestOrigin(): Promise<string | undefined> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (!host) return undefined;
    const proto =
      h.get("x-forwarded-proto") ??
      (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
    return `${proto}://${host}`;
  } catch {
    return undefined;
  }
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

/**
 * The asset's aspect ratio (width / height) from its own header - an SVG's
 * viewBox or width/height attributes, a PNG's IHDR - so the mark can be
 * drawn at LOGO_HEIGHT without stretching. Anything unreadable is square.
 */
function aspectRatio(asset: FetchedAsset): number {
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
    }
  } catch {
    // fall through to square
  }
  return 1;
}

function logoBox(asset: FetchedAsset): { width: number; height: number } {
  const ratio = aspectRatio(asset);
  const width = Math.round(LOGO_HEIGHT * (Number.isFinite(ratio) && ratio > 0 ? ratio : 1));
  return { width: Math.min(width, LOGO_MAX_WIDTH), height: LOGO_HEIGHT };
}

function displayHost(origin: string | undefined): string | null {
  if (!origin) return null;
  try {
    return new URL(origin).host;
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const copy = await loadSiteMetadata();
  // Assets come from the server answering this request first - it is the
  // one that certainly serves its own public/ - and from the configured
  // site url only when there is no request (static generation). The host
  // printed on the card is the other way round: the site's public origin.
  const configured = resolveSiteUrl(copy);
  const request = await requestOrigin();
  const origin = request ?? configured;
  const host = displayHost(configured ?? request);

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
