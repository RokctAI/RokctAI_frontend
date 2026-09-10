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

// The logos marquee's CLIENT half (since 1.18.0): the effect that reads
// base's resolved network strip (loadResolvedNetworkStrip is exported by
// base's "use client" components/custom/network-strip.tsx, so it is called
// here, on the client, as it always was) and the broken-image fallback,
// unchanged. Rendered by ./logos.tsx, the section's entry, which holds
// `meta` where the server can read it.

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
// The eight marks this slot showed until 1.13.0 (Walmart, Cisco, Netflix,
// Pinterest, Zoom, Sony, Ebay, Uber) were hotlinked from a chat template's
// CDN and were never Ray's; 1.13.0 turned the wall off and 1.17.0 retires
// the config list that held them.
//
// Once per page: agent-network-strip.ts registers the landing placement
// "section" (base_sdk >= 1.27.0), so base's own afterHero / beforeFooter
// surfaces draw nothing on /landing and base keeps the footer strip off
// that route; every other page - the opportunities pages among them -
// still gets the footer strip. This section asks base's rule for the
// "section" surface, so a placement that names another surface leaves
// this section empty rather than drawing the strip twice.

import React, { useEffect, useState } from "react";

import {
  logosTrack,
} from "@/components/custom/landing/agent-logos";
import {
  networkStripRendersAt,
  type ResolvedNetworkStrip,
} from "@/components/custom/landing/network-strip";
import type { LinkableNetworkSite } from "@/components/custom/landing/network-sites";
import { loadResolvedNetworkStrip } from "@/components/custom/network-strip";

/** The item box the old marquee drew each mark in, unchanged. */
const ITEM =
  "relative flex-shrink-0 h-8 w-24 md:h-12 md:w-40 flex items-center justify-center";
/** The image fills the box, as next/image `fill` + object-contain did. */
const MARK = "absolute inset-0 h-full w-full object-contain";
const WORDMARK = "text-lg font-bold tracking-tight text-zinc-700 dark:text-zinc-300";

function LogoLink({ site }: { site: LinkableNetworkSite }) {
  // A logo that will not load falls back to the name, so a site whose
  // asset moved is still named and still linked.
  const [broken, setBroken] = useState(false);
  const drawLogo = Boolean(site.logo) && !site.wordmark && !broken;
  return (
    <a
      href={site.url}
      target="_blank"
      rel="noopener"
      aria-label={site.name}
      data-network-site={site.key}
      className={ITEM}
    >
      {drawLogo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- a sibling site's own asset; no optimisation pass, no remotePatterns entry */}
          <img
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

export function Logos({ id }: { id?: string }) {
  // The registered config and the shell's host, resolved by base once per
  // module; this section is loaded on the client by the landing host, so
  // it reads the same promise the footer strip reads.
  const [strip, setStrip] = useState<ResolvedNetworkStrip | null>(null);
  useEffect(() => {
    let live = true;
    loadResolvedNetworkStrip()
      .then((resolved) => {
        if (live) setStrip(resolved);
      })
      .catch((error) => {
        console.error("[landing] the logos section could not resolve the network strip:", error);
      });
    return () => {
      live = false;
    };
  }, []);

  if (!strip || !networkStripRendersAt(strip, "section")) return null;
  const track = logosTrack(strip.sites);

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
