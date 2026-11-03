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

// The section's ENTRY (since 1.18.0): what agent_sdk's manifest registers
// in base_sdk's components/custom/landing/page-sections.ts, and what
// base_sdk >= 1.32.0's server-rendered landing (app/landing/page.tsx
// through components/custom/landing/landing-page.ts) imports to read
// `meta`. No "use client" here, on purpose: a module that starts with it
// hands the server only client-reference proxies, so `meta.order`,
// `meta.nav`, `meta.renders` and `meta.rootClass` all read undefined there
// - the id falls back to the module name, the floating nav says "Scroll to
// <module>", the header's anchors do not resolve. `meta` is plain data and
// this default export is a server component; everything that needs the
// browser lives in the sibling ./logos.client.tsx and is rendered
// from here.
//
// Since 1.18.1 the entry also RESOLVES the strip, on the server: base's
// registered network-strip config over its defaults, the list minus this
// shell and the hidden keys (components/custom/landing/network-strip.ts,
// the pure registry), and hands the result to the marquee as data. The
// marquee is then in the page's first HTML with the rest of the landing,
// as the old logos section was - 1.17.0 and 1.18.0 read the strip in a
// client effect after hydration, so the row was absent from the served
// page and popped in after it. base's own loadResolvedNetworkStrip is
// exported by its "use client" components/custom/network-strip.tsx, which
// a server component cannot call, so the same two steps are taken here.

import React from "react";

import { networkSiteHost } from "@/components/custom/landing/network-sites";
import {
  loadNetworkStrip,
  networkStripRendersAt,
  resolveNetworkStrip,
  type ResolvedNetworkStrip,
} from "@/components/custom/landing/network-strip";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";
import { loadSiteMetadata } from "@/components/custom/landing/site-metadata";
import { Logos } from "@/components/custom/logos.client";

export { Logos } from "@/components/custom/logos.client";

/**
 * What this section adds to base_sdk's landing host when registered in
 * components/custom/landing/page-sections.ts: its place in the
 * page order (after the chat section). It is not a floating-nav stop.
 */
export const meta: PageSectionMeta = { order: 20, nav: [] };

/**
 * This shell's own host, resolved as base's loadSelfHost
 * (components/custom/network-strip.tsx) resolves it: NEXT_PUBLIC_SITE_URL
 * first, else the `url` the registered site metadata carries, through the
 * list's own normalisation. Null lists every site.
 */
async function loadSelfHost(): Promise<string | null> {
  const fromEnv = networkSiteHost(process.env.NEXT_PUBLIC_SITE_URL);
  if (fromEnv) return fromEnv;
  return networkSiteHost((await loadSiteMetadata()).url);
}

/**
 * What the marquee draws, resolved once per render on the server. Null
 * when base's rule does not place the strip in the "section" surface or
 * no site is left to draw - the section then renders nothing - and on an
 * error, which is logged rather than thrown so the landing still renders.
 */
export async function loadLogosStrip(): Promise<ResolvedNetworkStrip | null> {
  try {
    const [config, selfHost] = await Promise.all([loadNetworkStrip(), loadSelfHost()]);
    const strip = resolveNetworkStrip(config, selfHost);
    return networkStripRendersAt(strip, "section") ? strip : null;
  } catch (error) {
    console.error("[landing] the logos section could not resolve the network strip:", error);
    return null;
  }
}

export default async function LogosEntry({ id }: PageSectionProps) {
  const strip = await loadLogosStrip();
  if (!strip) return null;
  return <Logos id={id} strip={strip} />;
}
