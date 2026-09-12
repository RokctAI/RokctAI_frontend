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

// The logos marquee's CLIENT half (since 1.18.0): the marquee and the
// broken-image fallback. Rendered by ./logos.tsx, the section's entry,
// which holds `meta` where the server can read it and - since 1.18.1 -
// resolves the strip on the server and hands it here as data, so the
// marquee is server-rendered with the page and never pops in after it.

// The landing page's logo marquee - since 1.17.0 the ONE "Trusted by" row
// on rokct.ai's landing page, and its items are the other sites of the
// Rokct network from base's one list (components/custom/landing/
// network-sites.ts), each a link to that site.
//
// Ray, 2026-09-09: "rokct already has a section called logos" - it is
// never deleted - and "logos should not lose function and its look". So
// this is still the marquee this file always was: the same section, the
// same eyebrow, the same track (grayscale at 70%, full colour on hover,
// the run paused while hovered, three lanes shifted by a third every 20s,
// the host's `marquee` keyframes), the same item box. What changed is what
// the boxes hold: base's resolved network sites - the shell itself left
// out by host, in base's order, minus what agent-network-strip.ts hides -
// under base's heading, "Trusted by". A site with a logo draws it (its
// dark twin in dark mode; the name if the image will not load), a wordmark
// site draws its name. Every box is a link to the site's own origin,
// target _blank, rel noopener, nothing else: no query string, no click
// handler, no measurement. The strip informs; it does not measure.
//
// Ray, 2026-09-10: "logos in rokct are wrong. wrong names and also it
// lost sizings and feel old one had". The names are base's list, drawn
// verbatim (base_sdk 1.32.1 carries each product's declared brand string;
// nothing here re-cases, shortens or truncates one). The sizing: the old
// marquee drew every logo as a picture filling the item box - 96x32 on a
// phone, 160x48 from `md` - so each mark stood the box's full height. A
// mark still does, in that same box. A wordmark site used to be drawn as
// 18px text inside the picture's box, a third of the height of the marks
// beside it; it is now drawn AS a mark: at the box's height (`text-2xl` in
// the 32px box, `md:text-4xl` in the 48px box, the letter height the old
// wordmark logos had), as wide as the name is, with the old box's width
// as its minimum. A name is never shrunk to fit a box meant for a
// picture.
//
// Ray, 2026-09-11 07:45Z: "use caps" - "use caps in logos". A wordmark
// (and the name a broken mark falls back to) is shown in capitals:
// `uppercase` on the span, a display transform and nothing more. The
// declared strings are untouched - "supacharge.school" is still the name,
// the aria-label and the alt; the page shows SUPACHARGE.SCHOOL - and no
// picture logo is filtered, re-drawn or replaced.
//
// The eight marks this slot showed until 1.13.0 (Walmart, Cisco, Netflix,
// Pinterest, Zoom, Sony, Ebay, Uber) were hotlinked from a chat template's
// CDN and were never Ray's; 1.13.0 turned the wall off and 1.17.0 retires
// the config list that held them.
//
// Once per page: agent-network-strip.ts registers the landing placement
// "section" (base_sdk >= 1.27.0), so base's own afterHero / beforeFooter
// surfaces draw nothing on /landing and base keeps the footer strip off
// that route; every other page - the opportunities pages among them -
// still gets the footer strip. The entry asks base's rule for the
// "section" surface, so a placement that names another surface leaves
// this section empty rather than drawing the strip twice.

import React, { useEffect, useRef, useState } from "react";

import {
  logosTrack,
} from "@/components/custom/landing/agent-logos";
import type { LinkableNetworkSite } from "@/components/custom/landing/network-sites";
import type { ResolvedNetworkStrip } from "@/components/custom/landing/network-strip";

/** The item box the old marquee drew each mark in, unchanged. */
const ITEM =
  "relative flex-shrink-0 h-8 w-24 md:h-12 md:w-40 flex items-center justify-center";
/** The image fills the box, as next/image `fill` + object-contain did. */
const MARK = "absolute inset-0 h-full w-full object-contain";
/**
 * A wordmark's box: the mark box's height, the mark box's width as a
 * minimum, and as wide as the name needs beyond that.
 */
const WORDMARK_ITEM =
  "relative flex-shrink-0 h-8 min-w-[6rem] md:h-12 md:min-w-[10rem] px-2 flex items-center justify-center";
/**
 * The name drawn as the mark: at the box's height, the declared string
 * shown in capitals (Ray, 2026-09-11 07:45Z: "use caps in logos") - a CSS
 * transform on the span only, so the string itself, the aria-label and the
 * alt stay exactly as declared.
 */
const WORDMARK =
  "uppercase text-2xl md:text-4xl font-bold tracking-tight leading-none text-zinc-700 dark:text-zinc-300";

function LogoLink({ site }: { site: LinkableNetworkSite }) {
  // A logo that will not load falls back to the name, so a site whose
  // asset moved is still named and still linked. The marquee is
  // server-rendered, so the browser may have tried (and failed) the image
  // before React attached onError; the mount check catches that case.
  const [broken, setBroken] = useState(false);
  const light = useRef<HTMLImageElement>(null);
  const dark = useRef<HTMLImageElement>(null);
  useEffect(() => {
    for (const img of [light.current, dark.current]) {
      if (img && img.complete && img.naturalWidth === 0) setBroken(true);
    }
  }, []);
  const drawLogo = Boolean(site.logo) && !site.wordmark && !broken;
  return (
    <a
      href={site.url}
      target="_blank"
      rel="noopener"
      aria-label={site.name}
      data-network-site={site.key}
      className={drawLogo ? ITEM : WORDMARK_ITEM}
    >
      {drawLogo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- a sibling site's own asset; no optimisation pass, no remotePatterns entry */}
          <img
            ref={light}
            src={site.logo}
            alt={site.name}
            className={`${MARK} ${site.logoDark ? "dark:hidden" : ""}`}
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
          />
          {site.logoDark && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={dark}
              src={site.logoDark}
              alt=""
              aria-hidden="true"
              className={`${MARK} hidden dark:block`}
              loading="lazy"
              decoding="async"
              onError={() => setBroken(true)}
            />
          )}
        </>
      ) : (
        <span className={WORDMARK}>{site.name}</span>
      )}
    </a>
  );
}

export function Logos({
  id,
  strip,
}: {
  id?: string;
  /** Base's strip, resolved by the entry on the server; drawn as it is. */
  strip: ResolvedNetworkStrip;
}) {
  const track = logosTrack(strip.sites);
  if (track.length === 0) return null;

  return (
    <section
      id={id}
      aria-label={strip.heading}
      data-network-strip="section"
      className="w-full bg-white dark:bg-[#0a0a0a] py-12 border-y border-zinc-100 dark:border-zinc-900 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
            {strip.heading}
          </p>

          <div className="w-full relative flex overflow-hidden mask-image-linear-gradient group">
            <div
              className="flex items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500 whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused]"
              style={{ animationDuration: "20s" }}
            >
              {track.map((site, idx) => (
                <LogoLink key={`${site.key}-${idx}`} site={site} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
