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

// The link-preview shell: turns the copy the home SDK registered in
// components/custom/landing/site-metadata.ts into the Next Metadata object
// the host layout and the landing page export. The host's app/layout.tsx
// is the one file that must call this itself (it is the host's own and no
// SDK ships it):
//
//   export const generateMetadata = () => buildSiteMetadata();
//
// in place of a literal `export const metadata = {...}`. Pass overrides
// for anything host-specific (icons, verification, robots); they are
// shallow-merged last, so a key given here replaces the built one whole.
//
// Since 1.17.0 the built Metadata also carries a FALLBACK favicon (Ray,
// 2026-09-09: "on builds that dont have favicon like supacharge you can
// make it to take first letter of domain"). The rule, in order: an
// `icons` override wins outright; a host that ships an icon file Next
// serves by convention (app/favicon.ico, app/icon.png|svg|ico,
// app/apple-icon.png, public/favicon.ico - checked on disk at call time,
// server-side only) gets NO `icons` key, so that file stays the icon; a
// registered `copy.icon` is linked next; and with none of those the links
// point at app/brand-icon/route.tsx, the generated tile with the domain's
// first letter. Nothing here ever replaces an icon the host already has.

import type { Metadata } from "next";

import {
  loadSiteMetadata,
  type SiteMetadataCopy,
} from "@/components/custom/landing/site-metadata";

/** The generated preview route base_sdk installs at app/opengraph-image.tsx. */
export const GENERATED_PREVIEW_IMAGE = "/opengraph-image";

/** The preview card's dimensions; the generated route draws at exactly this size. */
export const PREVIEW_IMAGE_SIZE = { width: 1200, height: 630 } as const;

/** The Open Graph locale used when the copy names none. */
export const DEFAULT_LOCALE = "en_ZA";

/** The generated icon route base_sdk installs at app/brand-icon/route.tsx. */
export const GENERATED_BRAND_ICON = "/brand-icon";

/**
 * The icon files Next serves by file convention, relative to the project
 * root. Any one of them present means the host has an icon of its own and
 * the built Metadata leaves `icons` alone.
 */
export const HOST_ICON_FILES = [
  "app/favicon.ico",
  "app/icon.png",
  "app/icon.svg",
  "app/icon.ico",
  "app/apple-icon.png",
  "public/favicon.ico",
] as const;

const PREVIEW_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
const RASTER_ICON_EXTENSIONS = [".png", ".jpg", ".jpeg"];

/**
 * The canonical origin: NEXT_PUBLIC_SITE_URL first (the deployment knows
 * where it is), else the copy's `url`, else undefined - in which case Next
 * falls back to VERCEL_PROJECT_PRODUCTION_URL or localhost for
 * metadataBase and the generated image draws without a logo.
 */
export function resolveSiteUrl(
  copy: Pick<SiteMetadataCopy, "url">,
): string | undefined {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return fromEnv || copy.url?.trim() || undefined;
}

/** Parses the origin into a URL, or undefined (logged) when it is not one. */
export function resolveMetadataBase(
  copy: Pick<SiteMetadataCopy, "url">,
): URL | undefined {
  const base = resolveSiteUrl(copy);
  if (!base) return undefined;
  try {
    return new URL(base);
  } catch (error) {
    console.error(`[site-metadata] site url "${base}" is not a URL:`, error);
    return undefined;
  }
}

/**
 * True only for a path or URL that ends in a raster preview format. An SVG
 * logo, however pretty, is not a preview image: the crawlers that unfurl a
 * link do not render it.
 */
export function isPreviewImage(path: string | undefined): path is string {
  if (!path) return false;
  const bare = path.split(/[?#]/, 1)[0].toLowerCase();
  return PREVIEW_IMAGE_EXTENSIONS.some((ext) => bare.endsWith(ext));
}

/**
 * The card image URL: the registered ready-made preview when it is a real
 * one, else the generated route (which draws the site name, the tagline
 * and the registered logo).
 */
export function resolvePreviewImage(
  copy: Pick<SiteMetadataCopy, "ogImage">,
): string {
  return isPreviewImage(copy.ogImage) ? copy.ogImage : GENERATED_PREVIEW_IMAGE;
}

/**
 * True when the host ships an icon file at one of HOST_ICON_FILES. Read
 * from disk at call time so a file added later is seen without a code
 * change; false in any environment without a filesystem (a browser
 * bundle, an edge runtime) or when the check itself fails.
 */
export async function hostIconExists(): Promise<boolean> {
  if (typeof window !== "undefined") return false;
  try {
    const [{ existsSync }, { join }] = await Promise.all([
      import("node:fs"),
      import("node:path"),
    ]);
    const root = process.cwd();
    return HOST_ICON_FILES.some((rel) => existsSync(join(root, rel)));
  } catch {
    return false;
  }
}

/** The icon links for the generated tile: 64 and 192 for browsers, 180 for the Apple touch icon. */
export function generatedIcons(): NonNullable<Metadata["icons"]> {
  return {
    icon: [
      { url: `${GENERATED_BRAND_ICON}?s=64`, sizes: "64x64", type: "image/png" },
      { url: `${GENERATED_BRAND_ICON}?s=192`, sizes: "192x192", type: "image/png" },
    ],
    apple: `${GENERATED_BRAND_ICON}?s=180`,
  };
}

/**
 * The icon links for a registered `copy.icon`: the file itself, and as the
 * Apple touch icon too when it is a raster (Safari does not take an SVG
 * or an .ico there).
 */
export function registeredIcons(icon: string): NonNullable<Metadata["icons"]> {
  const bare = icon.split(/[?#]/, 1)[0].toLowerCase();
  const raster = RASTER_ICON_EXTENSIONS.some((ext) => bare.endsWith(ext));
  return raster ? { icon, apple: icon } : { icon };
}

/**
 * The `icons` the built Metadata carries, or undefined to carry none:
 * undefined when the host ships an icon file (Next serves it by
 * convention and it must stay the icon); the registered `copy.icon`
 * when there is one; else the generated /brand-icon tile.
 */
export async function resolveIcons(
  copy: Pick<SiteMetadataCopy, "icon">,
): Promise<Metadata["icons"] | undefined> {
  if (await hostIconExists()) return undefined;
  const registered = copy.icon?.trim();
  return registered ? registeredIcons(registered) : generatedIcons();
}

export interface BuildSiteMetadataOptions {
  /**
   * Where the result is exported from. A "layout" (the default) sets
   * `title: { default, template }` so every page below it is titled
   * `<page> — <siteName>`; a "page" sets `title: { absolute }` so the copy's
   * title is used as it is, instead of being run through the layout's
   * template a second time.
   */
  scope?: "layout" | "page";
}

/**
 * Builds the shell's Metadata from the registered copy. `overrides` are
 * shallow-merged last.
 */
export async function buildSiteMetadata(
  overrides?: Partial<Metadata>,
  options: BuildSiteMetadataOptions = {},
): Promise<Metadata> {
  const copy = await loadSiteMetadata();
  const siteName = copy.siteName || copy.title;
  const title = copy.title || siteName;
  const description = copy.description || undefined;
  const image = resolvePreviewImage(copy);
  const metadataBase = resolveMetadataBase(copy);
  // The disk check is skipped when the caller overrides `icons` anyway.
  const icons = overrides?.icons === undefined ? await resolveIcons(copy) : undefined;

  const built: Metadata = {
    ...(metadataBase ? { metadataBase } : {}),
    ...(icons ? { icons } : {}),
    title:
      options.scope === "page"
        ? { absolute: title }
        : { default: title, template: `%s — ${siteName}` },
    description,
    applicationName: siteName,
    ...(copy.keywords && copy.keywords.length > 0
      ? { keywords: copy.keywords }
      : {}),
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: "/",
      siteName,
      title,
      description,
      locale: copy.locale ?? DEFAULT_LOCALE,
      images: [
        {
          url: image,
          width: PREVIEW_IMAGE_SIZE.width,
          height: PREVIEW_IMAGE_SIZE.height,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };

  return { ...built, ...(overrides ?? {}) };
}

/**
 * The same Metadata for a PAGE's generateMetadata (the landing page uses
 * it): the title is absolute, so a layout that already applies the
 * `%s — <siteName>` template does not suffix it twice.
 */
export function buildPageMetadata(
  overrides?: Partial<Metadata>,
): Promise<Metadata> {
  return buildSiteMetadata(overrides, { scope: "page" });
}
