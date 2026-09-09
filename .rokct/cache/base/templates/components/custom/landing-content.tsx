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

// The generic landing host's client orchestrator: the shared header with
// the menu a home SDK registered inside it, the hero, then every section
// the composed SDKs registered in
// ./landing/page-sections.ts, loaded with a dynamic import and rendered in
// ascending `meta.order`, skipping any whose `meta.renders` turns this page
// down and leaving those out of the floating nav with it. This file names
// no section of its own - base_sdk carries the host and the hero only; the
// sections of a product's landing page belong to its home SDK - so a shell
// with nothing registered renders the hero alone. A negative order renders
// before the hero (a fixed overlay such as a floating nav) and stays visible
// while the hero shows search results; everything else renders after the
// hero and hides with it.

import React, { useEffect, useMemo, useState } from "react";

import type { LandingPlan } from "@/app/actions/base/landing";
import { Header } from "@/components/custom/header";
import { Hero } from "@/components/custom/hero";
import {
  loadHeaderMenu,
  resolveHeaderMenu,
  type HeaderMenu,
} from "@/components/custom/landing/header-menu";
import {
  LANDING_CONFIG,
  type LandingNavItem,
} from "@/components/custom/landing/landing-config";
import {
  DEFAULT_PAGE_SECTION_ORDER,
  PAGE_SECTIONS,
  type PageSectionComponent,
  type PageSectionMeta,
} from "@/components/custom/landing/page-sections";

interface LoadedSection {
  id: string;
  /** The DOM id: the first nav entry's id, else meta.anchor, else the registry id. */
  domId: string;
  order: number;
  /** The section's floating-nav entries; empty when it is not a nav stop. */
  nav: LandingNavItem[];
  Component: PageSectionComponent;
  meta: PageSectionMeta;
}

function RegisteredSections({
  sections,
  plans,
  nav,
  session,
}: {
  sections: LoadedSection[];
  plans: LandingPlan[];
  nav: LandingNavItem[];
  session?: unknown;
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

export function LandingContent({
  plans,
  session,
}: {
  plans: LandingPlan[];
  session?: unknown;
}) {
  const [searchActive, setSearchActive] = useState(false);
  const [sections, setSections] = useState<LoadedSection[]>([]);
  const [headerMenu, setHeaderMenu] = useState<HeaderMenu | null>(null);

  // Load the registered sections once, on the client, and keep them in
  // page order. A section that fails to load is logged and skipped; the
  // page still renders.
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      PAGE_SECTIONS.map(async (entry): Promise<LoadedSection | null> => {
        try {
          const mod = await entry.load();
          const meta = mod.meta ?? {};
          const nav = meta.nav ?? [{ id: entry.id, label: entry.id }];
          return {
            id: entry.id,
            domId: nav[0]?.id ?? meta.anchor ?? entry.id,
            order: meta.order ?? DEFAULT_PAGE_SECTION_ORDER,
            nav,
            Component: mod.default,
            meta,
          };
        } catch (e) {
          console.error(`[landing] section "${entry.id}" failed to load:`, e);
          return null;
        }
      }),
    ).then((loaded) => {
      if (!cancelled) {
        // Array.prototype.sort is stable: registry order breaks ties.
        setSections(
          loaded
            .filter((s): s is LoadedSection => s !== null)
            .sort((a, b) => a.order - b.order),
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // The registered header menu, loaded once on the client beside the
  // sections. Nothing registered answers null and the header renders no
  // navigation: logo, theme toggle and the auth links only.
  useEffect(() => {
    let cancelled = false;
    loadHeaderMenu().then((menu) => {
      if (!cancelled) setHeaderMenu(menu);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // The sections that belong on this page. A section's `meta.renders` is
  // asked once, here, and everything below - what the page draws and what
  // the floating nav lists - comes off the same answer, so the two can
  // never disagree and a nav tick always has a section to scroll to.
  // A section that declares no predicate always belongs.
  const present = useMemo(
    () => sections.filter((s) => s.meta.renders?.({ plans, session }) ?? true),
    [sections, plans, session],
  );

  const overlays = useMemo(() => present.filter((s) => s.order < 0), [present]);
  const flow = useMemo(() => present.filter((s) => s.order >= 0), [present]);

  const navItems = useMemo<LandingNavItem[]>(
    () => [
      LANDING_CONFIG.nav.hero,
      ...present.flatMap((s) => s.nav),
      LANDING_CONFIG.nav.footer,
    ],
    [present],
  );

  // The header menu comes off `navItems`, the very list the floating nav
  // renders, so a header link and a nav tick can never disagree about what
  // is on the page: an anchor whose section was turned down by `meta.renders`
  // is not in `navItems` and so is not in the menu either (nor in a group).
  const menu = useMemo(
    () => resolveHeaderMenu(headerMenu, navItems),
    [headerMenu, navItems],
  );

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      {/* The header carries the menu itself (inline from lg up, behind its
          burger below) and pins itself, so there is no wrapper and no row
          under it: one element tree whether or not a menu is registered. */}
      <Header
        loginUrl={LANDING_CONFIG.loginUrl}
        signupUrl={LANDING_CONFIG.signupUrl}
        session={session}
        menuItems={menu.items}
        groups={menu.groups}
        actions={menu.actions}
      />
      <main className="flex-1">
        <RegisteredSections
          sections={overlays}
          plans={plans}
          nav={navItems}
          session={session}
        />
        <Hero
          id={LANDING_CONFIG.nav.hero.id}
          signupUrl={LANDING_CONFIG.signupUrl}
          onResultsChange={setSearchActive}
        />
        <div style={{ display: searchActive ? "none" : undefined }}>
          <RegisteredSections
            sections={flow}
            plans={plans}
            nav={navItems}
            session={session}
          />
        </div>
        <div id={LANDING_CONFIG.nav.footer.id} />
      </main>
    </div>
  );
}
