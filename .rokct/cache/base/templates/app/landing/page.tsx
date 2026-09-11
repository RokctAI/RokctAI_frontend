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

// The generic landing host's page: reads the session through the kernel's
// seam (never through app/(auth) directly), prefetches the platform's plans
// and - since 1.32.0 - does the registry work on the server (Ray,
// 2026-09-10: "hero i think should be server side if not the whole
// landing"): every section the composed SDKs registered in
// components/custom/landing/page-sections.ts is awaited here, `meta.renders`
// asked, the page order and the floating nav built, the header menu
// resolved against that nav and the hero's copy overlaid, all through
// components/custom/landing/landing-page.ts. The sections and the hero are
// rendered here too and handed, with the resolved menu, to the thin client
// wrapper components/custom/landing-content.tsx, which keeps only what
// needs the client (hiding the sections while the hero shows results). So
// the first HTML carries the header links, the hero's words and every
// section; nothing about the page is loaded after mount.
//
// base_sdk carries the host and the hero (copy in
// components/custom/landing/hero-config.ts); every content section comes
// from the home SDK that registers it (the hero's form from
// components/custom/landing/hero-form.ts, and what answers its input from
// components/custom/landing/hero-sections.ts), so with nothing registered
// the page is the hero alone. It also imports the platform scrollbar
// (app/styles/rokct-scroll.css, rokctai_frontend's yellow scroll thumb),
// so a composed shell has it on /landing with no host edit.

import "@/app/styles/rokct-scroll.css";

import React from "react";

import { getLandingPlans, type LandingPlan } from "@/app/actions/base/landing";
import { buildPageMetadata } from "@/app/lib/site-metadata";
import { getPlatformSession } from "@/app/services/base/session";
import { Hero } from "@/components/custom/hero";
import { LandingContent } from "@/components/custom/landing-content";
import { LANDING_CONFIG } from "@/components/custom/landing/landing-config";
import {
  resolveLandingPage,
  type LoadedSection,
} from "@/components/custom/landing/landing-page";
import type { LandingNavItem } from "@/components/custom/landing/landing-config";
import { siteDataMode } from "@/lib/site-data/read-site-data";
import type { SiteDataMode } from "@/lib/site-data/kinds";

export const dynamic = "force-dynamic";

// The page an anonymous visitor is redirected to carries the link-preview
// tags itself (title, description, Open Graph and Twitter cards) from the
// copy the home SDK registered in components/custom/landing/site-metadata.ts,
// so a shared /landing link unfurls right even before the host layout
// adopts buildSiteMetadata(). The page form keeps the title absolute, so a
// layout that already applies the `%s — <siteName>` template does not
// suffix it twice.
export async function generateMetadata() {
  return buildPageMetadata();
}

/**
 * The registered sections, rendered on the server in page order with
 * PageSectionProps, each followed by an empty anchor for every extra nav
 * entry it declared. The section modules stay in the home SDK; since they
 * are imported here, on the server, each entry module is server-safe (no
 * "use client"; the interactive part is a sibling `<name>.client.tsx` the
 * entry renders) - see components/custom/landing/page-sections.ts.
 */
function RegisteredSections({
  sections,
  plans,
  nav,
  session,
  dataMode,
}: {
  sections: LoadedSection[];
  plans: LandingPlan[];
  nav: LandingNavItem[];
  session?: unknown;
  dataMode: SiteDataMode;
}) {
  return (
    <>
      {sections.map(({ id, domId, Component, nav: entries }) => (
        <React.Fragment key={id}>
          <Component
            id={domId}
            signupUrl={LANDING_CONFIG.signupUrl}
            loginUrl={LANDING_CONFIG.loginUrl}
            session={session}
            plans={plans}
            nav={nav}
            dataMode={dataMode}
          />
          {/* Empty anchors for the section's extra nav entries. */}
          {entries.slice(1).map((item) => (
            <div key={item.id} id={item.id} />
          ))}
        </React.Fragment>
      ))}
    </>
  );
}

export default async function LandingPage() {
  const session = await getPlatformSession();
  // The shell's data mode (1.35.0; composer.json "data", bundled at build
  // time). A "local" shell has no backend: its plans are never fetched
  // (the empty list every section already handles), and the arrangement
  // drops the header's sign-in / sign-up buttons.
  const dataMode = siteDataMode();
  let plans: LandingPlan[] = [];
  if (dataMode !== "local") {
    try {
      plans = await getLandingPlans();
    } catch (e) {
      console.error("[landing] prefetch error:", e);
    }
  }
  const page = await resolveLandingPage({ plans, session, dataMode });
  return (
    <LandingContent
      session={session}
      menu={page.menu}
      rootClass={page.rootClass}
      dataMode={dataMode}
      overlays={
        <RegisteredSections
          sections={page.overlays}
          plans={plans}
          nav={page.navItems}
          session={session}
          dataMode={dataMode}
        />
      }
      hero={
        <Hero
          id={LANDING_CONFIG.nav.hero.id}
          signupUrl={LANDING_CONFIG.signupUrl}
        />
      }
      sections={
        <RegisteredSections
          sections={page.flow}
          plans={plans}
          nav={page.navItems}
          session={session}
          dataMode={dataMode}
        />
      }
    />
  );
}
