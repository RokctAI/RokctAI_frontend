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

// The network strip: the other sites of the Rokct network under a heading
// (default "Trusted by"), one link per site, drawn as its logo when it has
// one and as its name when it does not. Generic chrome, like the footer
// row: no product name and no brand hue in the markup, neutral alphas only,
// so it sits on whatever ground the page has in either theme.
//
// The shape of a site and the list rules are
// components/custom/landing/network-sites.ts; the home SDK's say (the
// sites themselves since 1.40.0, the heading, order, hidden keys and
// placement) is components/custom/landing/network-strip.ts. This file
// only draws.
//
// Where the sites come from (1.40.0; base carries none): the registered
// config's `sites` win. With none registered, the shell's own
// `data/network.json` (lib/site-data kind "network") is read through the
// app/actions/base/network-sites.ts server action AFTER MOUNT - a server
// function cannot be called while a client component renders on the
// server, and the data module is server-only - so the server-rendered
// markup and the first client render agree (no strip), and the strip
// appears once the action answers, the way the footer's status indicator
// does. With neither, nothing is drawn on any surface. A registered
// config never waits: its sites render with the page.
//
// A shell never lists itself: the site whose host matches the shell's own
// - NEXT_PUBLIC_SITE_URL first, else the `url` the home SDK registered in
// ./landing/site-metadata.ts, normalised as app/lib/site-metadata.ts's
// resolveDisplayHost normalises a host - is left out. That is the
// CONFIGURED site, not the request host: a white-label domain in front of
// the same deployment is still the same product.
//
// Every link is the site's own origin with rel="noopener" and nothing
// else: no query string, no tracking parameter, no click handler that
// reports anywhere. The strip informs; it does not measure.
//
// The config and the shell's host are resolved ONCE per module and
// rendered through next/dynamic the way the header renders its brand, so
// the strip is server-rendered with the page and never pops in after it.
//
// Once per page (since 1.27.0): the body reads the current pathname, so
// the footer surface - drawn by the shell's layout footer on every route,
// the landing route included - yields on /landing whenever the landing
// placement is not "none", and a home SDK's own section may carry the
// strip there instead (placement "section"; it reads
// loadResolvedNetworkStrip below and asks networkStripRendersAt for the
// "section" surface).

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

import { getNetworkSites } from "@/app/actions/base/network-sites";
import {
  isLandingRoute,
  loadNetworkStrip,
  networkStripRendersAt,
  resolveNetworkStrip,
  withOwnNetworkSites,
  type NetworkStripConfig,
  type NetworkStripSurface,
  type OwnNetworkSites,
  type ResolvedNetworkStrip,
} from "@/components/custom/landing/network-strip";
import {
  networkSiteHost,
  type LinkableNetworkSite,
} from "@/components/custom/landing/network-sites";
import { loadSiteMetadata } from "@/components/custom/landing/site-metadata";

/**
 * The current shell's host: NEXT_PUBLIC_SITE_URL (inlined into the client
 * bundle at build time), else the registered site-metadata `url`. Null
 * when neither is set, and the strip then lists every site.
 */
export async function loadSelfHost(): Promise<string | null> {
  const fromEnv = networkSiteHost(process.env.NEXT_PUBLIC_SITE_URL);
  if (fromEnv) return fromEnv;
  try {
    return networkSiteHost((await loadSiteMetadata()).url);
  } catch (error) {
    console.error("[landing] failed to load the site copy for the network strip:", error);
    return null;
  }
}

/** The registered config (or null) and the shell's host, as the strip needs both. */
export interface NetworkStripInputs {
  config: NetworkStripConfig | null;
  selfHost: string | null;
}

/** The registered config and the shell's host, loaded together; server-safe. */
export async function loadNetworkStripInputs(): Promise<NetworkStripInputs> {
  const [config, selfHost] = await Promise.all([loadNetworkStrip(), loadSelfHost()]);
  return { config, selfHost };
}

/**
 * The shell's own `data/network.json` through the server action; `null`
 * when the action cannot be reached (a client component rendering on the
 * server) or answers nothing, so the caller lays nothing under the config.
 */
export async function loadOwnNetworkSites(): Promise<OwnNetworkSites | null> {
  try {
    const own = await getNetworkSites();
    return own.sites.length > 0 ? own : null;
  } catch {
    return null;
  }
}

/**
 * The registered config, the shell's own data laid under it (registered
 * sites win, else the shell's data, else none) and the shell's host,
 * resolved into what to draw. For a caller on the server or after mount;
 * the module-level render below stages the data read after mount itself.
 */
export async function loadResolvedNetworkStrip(): Promise<ResolvedNetworkStrip> {
  const { config, selfHost } = await loadNetworkStripInputs();
  const own = config?.sites === undefined ? await loadOwnNetworkSites() : null;
  return resolveNetworkStrip(withOwnNetworkSites(config, own), selfHost);
}

export interface NetworkStripProps {
  /** Which surface this render is: the strip draws only where its placement says. */
  surface: NetworkStripSurface;
  /** Extra classes on the section, for the spacing a footer wants. */
  className?: string;
}

const HEADING =
  "text-xs font-semibold uppercase tracking-widest opacity-60";
const LINK =
  "flex h-8 items-center opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 focus-visible:opacity-100 focus-visible:grayscale-0";
const WORDMARK = "text-lg font-bold tracking-tight";

function NetworkSiteLink({ site }: { site: LinkableNetworkSite }) {
  // A logo that will not load falls back to the name, so a site whose
  // asset moved is still named and still linked. The strip is
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
      className={LINK}
      aria-label={site.name}
      data-network-site={site.key}
    >
      {drawLogo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- a sibling site's own asset; no optimisation pass, no remotePatterns entry */}
          <img
            ref={light}
            src={site.logo}
            alt={site.name}
            className={`h-7 w-auto ${site.logoDark ? "dark:hidden" : ""}`}
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
              className="hidden h-7 w-auto dark:block"
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

/** The markup, given what to draw; exported for a footer that resolves the strip itself. */
export function NetworkStripBody({
  strip,
  surface,
  className = "",
}: NetworkStripProps & { strip: ResolvedNetworkStrip }) {
  // The route decides whether the footer surface yields (once per page);
  // null - a render outside the App Router - is any other route.
  const pathname = usePathname();
  if (!networkStripRendersAt(strip, surface, isLandingRoute(pathname))) return null;
  const spacing =
    surface === "footer"
      ? "py-6"
      : "py-12 border-y border-black/5 dark:border-white/5";

  return (
    <section
      aria-label={strip.heading}
      data-network-strip={surface}
      className={`w-full ${spacing} ${className}`}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 sm:px-6 lg:px-8">
        <p className={HEADING}>{strip.heading}</p>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {strip.sites.map((site) => (
            <li key={site.key}>
              <NetworkSiteLink site={site} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * The shell's own sites, read once after mount and only while the
 * registered config names none; null before the answer and when there is
 * nothing to lay under the config.
 */
function useOwnNetworkSites(wanted: boolean): OwnNetworkSites | null {
  const [own, setOwn] = useState<OwnNetworkSites | null>(null);
  useEffect(() => {
    if (!wanted) return;
    let live = true;
    loadOwnNetworkSites().then((next) => {
      if (live && next) setOwn(next);
    });
    return () => {
      live = false;
    };
  }, [wanted]);
  return own;
}

// The config and the host resolved once per module, server-rendered with
// the page; the shell's own data, when the config leaves the sites to it,
// after mount.
const ResolvedNetworkStripBody: React.ComponentType<NetworkStripProps> = dynamic(() =>
  loadNetworkStripInputs().then(({ config, selfHost }) => ({
    default: function LoadedNetworkStrip(props: NetworkStripProps) {
      const own = useOwnNetworkSites(config?.sites === undefined);
      const strip = useMemo(
        () => resolveNetworkStrip(withOwnNetworkSites(config, own), selfHost),
        [own],
      );
      return <NetworkStripBody strip={strip} {...props} />;
    },
  })),
);

/**
 * The strip for one surface. Renders nothing where the resolved placement
 * does not name that surface, on the landing route for the footer surface
 * while the page carries the strip itself, or when no site is left to draw.
 */
export function NetworkStrip(props: NetworkStripProps) {
  return <ResolvedNetworkStripBody {...props} />;
}

export default NetworkStrip;
