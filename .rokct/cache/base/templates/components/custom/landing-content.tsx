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

// The generic landing host's client WRAPPER (since 1.32.0 - until 1.31.0
// this was the orchestrator, and it loaded every registered section, the
// header menu and the hero copy in effects after mount, so the first HTML
// carried none of them). Now app/landing/page.tsx does that work on the
// server, through components/custom/landing/landing-page.ts, and hands
// this component the results: the header menu resolved against the live
// nav, the hero and the sections already rendered (server elements, passed
// as props), and the class names the root carries from the first HTML.
// What stays here is the one thing that needs the client: whether the
// hero's form is showing results, which hides the sections under it. That
// setter reaches the server-rendered hero through HeroResultsContext, so
// no function ever crosses the server boundary as a prop.
//
// This file still names no section of its own - base_sdk carries the host
// and the hero only; the sections of a product's landing page belong to
// its home SDK - so a shell with nothing registered renders the hero
// alone. A negative order renders before the hero (a fixed overlay such as
// a floating nav) and stays visible while the hero shows search results;
// everything else renders after the hero and hides with it. Since 1.23.0
// the network strip (components/custom/network-strip.tsx) has two surfaces
// here too - right under the hero and right before the footer anchor - and
// draws on the one the home SDK's registered placement names, or on
// neither: "none", or (since 1.27.0) "section", where a registered section
// of the home SDK's own draws the strip in its own look.

import React, { useState } from "react";

import { Header } from "@/components/custom/header";
import { HeroResultsContext } from "@/components/custom/hero-view";
import { NetworkStrip } from "@/components/custom/network-strip";
import type { ResolvedHeaderMenu } from "@/components/custom/landing/header-menu";
import { LANDING_CONFIG } from "@/components/custom/landing/landing-config";
import type { SiteDataMode } from "@/lib/site-data/kinds";

export interface LandingContentProps {
  session?: unknown;
  /** The header menu, resolved on the server against the page's live nav. */
  menu: ResolvedHeaderMenu;
  /** The hero, rendered on the server (components/custom/hero.tsx). */
  hero: React.ReactNode;
  /** The sections with a negative order, rendered on the server: before the hero, never hidden. */
  overlays?: React.ReactNode;
  /** Every other section, rendered on the server: after the hero, hidden while it shows results. */
  sections?: React.ReactNode;
  /** Class names the root carries from the first HTML (every present section's `meta.rootClass`). */
  rootClass?: string;
  /**
   * The shell's data mode (1.38.0), as the page read it through
   * `siteDataMode()`; handed to the header, which skips its own Log in /
   * Sign up pair on a "local" shell. Absent draws the pair, as before.
   */
  dataMode?: SiteDataMode;
}

export function LandingContent({
  session,
  menu,
  hero,
  overlays,
  sections,
  rootClass,
  dataMode,
}: LandingContentProps) {
  const [searchActive, setSearchActive] = useState(false);
  const rootClassName = ["flex flex-col min-h-screen bg-white dark:bg-black", rootClass?.trim()]
    .filter((c) => c)
    .join(" ");

  return (
    <HeroResultsContext.Provider value={setSearchActive}>
      <div className={rootClassName}>
        {/* The header carries the menu itself (inline from lg up, behind its
            burger below) and pins itself, so there is no wrapper and no row
            under it: one element tree whether or not a menu is registered.
            The menu arrives resolved, so its links are in the first HTML. */}
        <Header
          loginUrl={LANDING_CONFIG.loginUrl}
          signupUrl={LANDING_CONFIG.signupUrl}
          session={session}
          menuItems={menu.items}
          groups={menu.groups}
          megaLabel={menu.megaLabel}
          actions={menu.actions}
          dataMode={dataMode}
        />
        <main className="flex-1">
          {overlays}
          {hero}
          <div style={{ display: searchActive ? "none" : undefined }}>
            {/* The network strip's two landing surfaces (since 1.23.0): the
                strip draws on the one its registered placement names, or on
                neither - the default, and "section", where one of the
                registered sections below carries it - and hides with the
                sections while the hero shows search results. */}
            <NetworkStrip surface="afterHero" />
            {sections}
            <NetworkStrip surface="beforeFooter" />
          </div>
          <div id={LANDING_CONFIG.nav.footer.id} />
        </main>
      </div>
    </HeroResultsContext.Provider>
  );
}
