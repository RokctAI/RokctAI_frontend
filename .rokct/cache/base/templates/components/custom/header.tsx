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

// The site header every rokct shell renders: ONE component, shipped by
// base_sdk since 1.14.0, with the menu INSIDE it.
//
// Ray, 2026-09-09: rokct.ai and supacharge.app must use the same header,
// links inline on desktop, and on a phone the menu must not show in the
// header at all except behind a burger. So:
//
//  - from the `lg` breakpoint up the bar is logo | section links and the
//    groups' one trigger (nav[aria-label="Sections"]; since 1.18.0 it opens
//    ONE panel the width of the bar, anchored under it - the bar's
//    backdrop-filter is that panel's containing block) | actions, theme
//    toggle, auth - rokctai_frontend's chrome (fixed-height bar, blurred
//    translucent ground, mega-menu hover) as the reference;
//  - below `lg` the bar is logo | burger, nothing else: the links, the
//    groups, the actions, the theme toggle and the auth buttons all sit in
//    a full-screen panel under the bar that the burger opens. The panel
//    closes on a tap on any of its links, on Escape, on a route change and
//    on the burger again, and the page behind it does not scroll while it
//    is open.
//
// Generic chrome: the words come resolved from
// components/custom/landing/header-menu.ts (a home SDK registers them; see
// that file), the brand from the host's own brand-logo.tsx / branding.tsx
// and the theme control from its theme-toggle.tsx (all three `requires`
// files, so each shell keeps its mark and its toggle), and the colours are
// the shell's theme tokens - background, foreground, border, primary - so
// rokct.ai renders it in its palette and Supacharge in its own without
// either editing this file.
//
// Since 1.21.0 the home SDK says what the brand slot draws (Ray,
// 2026-09-09: "i saw supacharge got a s logo in header, let home sdk
// declare if it needs logo there or not. supacharge text is the logo right
// now until i design an icon"). The menu's `brand.logo` is "none" (no
// image, the wordmark is the logo), a path (that image) or "auto" (a real
// icon: the copy's registered `icon`, else the host's own brand-logo.tsx -
// the mark every shell drew before, so nothing declared draws what it drew
// before). The declaration is loaded through next/dynamic, the way the
// hero loads its form, so the first paint on the server already carries
// the right mark and the "S" never flashes. The generated /brand-icon
// letter tile is for the tab and the share card and is never drawn here.
//
// Since 1.24.0 the declaration may also switch on the two things rokct.ai's
// old header did with its brand that 1.21.0 dropped (Ray, 2026-09-09:
// "header lost functions the old rokct header had"; rokct.ai keeps
// everything its old host header had): `brand.badge` draws the host's mark
// with its badge (rokct.ai's BETA strip), and `brand.collapse` is the
// collapsing brand - 44px mark and a large wordmark that slides away after
// load, leaving the mark, the visitor's country code and a chevron, while
// the desktop nav fades until the pointer is over the bar or the page is
// scrolled. Both are off unless declared, so a shell that registers
// neither (Supacharge) renders byte-for-byte what it did.
//
// The public API is the one the two shells' own headers had, so the pages
// that already render <Header> (the auth pages, status, careers) compile
// unchanged: loginUrl / signupUrl / session, and the openLoginPopup /
// openSignupPopup handlers auth_sdk's pages pass instead of URLs. The menu
// props are new and all optional. When a caller passes NONE of menuItems /
// groups / actions the header loads the registered menu itself
// (loadHeaderMenu(), resolved against `nav` - the empty list unless the
// caller has one - so the fixed links, groups and actions render on every
// page that mounts the header while an anchor renders only where its
// section is on the page); the landing host passes the menu it resolved
// against its live nav, and props win when present.
//
// It is `sticky`, not `fixed`: it stays in the document flow, so no page
// under it needs a top padding to keep its first line visible (the hero's
// own pt-16 is unchanged from 1.13.0 either way).

import React, { useCallback, useEffect, useId, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, X } from "lucide-react";

import { PLATFORM_NAME } from "@/app/config/platform";
import t from "@/app/lib/i18n";
import { BrandLogo } from "@/components/custom/brand-logo";
import { Branding } from "@/components/custom/branding";
import {
  HeaderMenuActions,
  HeaderMenuList,
  HeaderMenuNav,
} from "@/components/custom/header-menu";
import {
  HEADER_MENU,
  loadHeaderBrand,
  loadHeaderMenu,
  resolveHeaderBrand,
  resolveHeaderMenu,
  type HeaderBrandCode,
  type HeaderMenuAction,
  type HeaderMenuItem,
  type HeaderMenuResolvedGroup,
  type ResolvedHeaderBrand,
  type ResolvedHeaderMenu,
} from "@/components/custom/landing/header-menu";
import type { LandingNavItem } from "@/components/custom/landing/landing-config";
import { SITE_METADATA } from "@/components/custom/landing/site-metadata";
import { ThemeToggle } from "@/components/custom/theme-toggle";
import { cn } from "@/lib/utils";

export interface HeaderProps {
  loginUrl?: string;
  signupUrl?: string;
  /** Where a signed-in visitor's Dashboard link goes. */
  dashboardUrl?: string;
  /** The page's session, or null/undefined when nobody is signed in. */
  session?: unknown;
  /** auth_sdk's login/register pages pass these instead of URLs. */
  openLoginPopup?: () => void;
  openSignupPopup?: () => void;
  /** The flat menu entries, resolved by resolveHeaderMenu(). */
  menuItems?: HeaderMenuItem[];
  /** The panel's groups (first leads), resolved by resolveHeaderMenu(). */
  groups?: HeaderMenuResolvedGroup[];
  /** The call-to-action buttons, as the home SDK declared them. */
  actions?: HeaderMenuAction[];
  /**
   * The page's live nav, used only when the header loads the menu itself
   * (no menuItems/groups/actions given) to resolve anchors. A page without
   * sections leaves it out and the anchors are dropped.
   */
  nav?: LandingNavItem[];
}

/** The mark alone, at `size` px: the host's own brand-logo.tsx or the declared image. */
function BrandMark({ brand, size }: { brand: ResolvedHeaderBrand; size: 32 | 44 }) {
  if (brand.logo === "none") return null;
  if (brand.logo === "host") {
    // The literal 32px call is the undeclared shell's mark, unchanged since
    // 1.21.0; the badge (1.24.0) and the collapsing brand's 44px are only
    // ever reached through a declaration.
    if (size === 32 && !brand.badge) return <BrandLogo width={32} height={32} />;
    return <BrandLogo width={size} height={size} showBadge={brand.badge} />;
  }
  // A plain <img>: the path may be any origin, and a small mark needs no
  // optimisation pipeline.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={brand.logo.src}
      alt={brand.wordmark ? "" : PLATFORM_NAME}
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", size === 44 ? "h-11 w-11" : "h-8 w-8")}
    />
  );
}

/**
 * The brand link's content, as resolved: the mark ("host" is the host
 * shell's own brand-logo.tsx, `{ src }` an image, "none" nothing) and then
 * the wordmark unless the home SDK turned it off. A brand that collapses
 * (1.24.0) renders through [CollapsingBrand] instead.
 */
function BrandBlock({
  brand,
  collapsed = false,
}: {
  brand: ResolvedHeaderBrand;
  /** Only read by a collapsing brand: whether the wordmark has slid away. */
  collapsed?: boolean;
}) {
  if (brand.collapse) return <CollapsingBrand brand={brand} collapsed={collapsed} />;
  return (
    <>
      <BrandMark brand={brand} size={32} />
      {brand.wordmark && <Branding className="text-xl" />}
    </>
  );
}

/** [HeaderBrandCollapse.code]'s answer, normalised: the text and its style, or nothing. */
function toBrandCode(answer: HeaderBrandCode | string | null | undefined): HeaderBrandCode | null {
  if (!answer) return null;
  if (typeof answer === "string") return answer.trim() ? { text: answer } : null;
  return answer.text?.trim() ? answer : null;
}

/**
 * rokct.ai's collapsing brand (1.24.0), its old header's markup in theme
 * tokens: the mark at 44px, then a 250px slot holding the large wordmark
 * that closes once `collapsed` is set (the header sets it `delayMs` after
 * mount), and beside the mark a slot for the country code that opens at
 * the same moment. The code is asked of the declaration once, on the
 * client, after mount - rokct.ai answers it from its branding cache, so a
 * first visit with an empty cache collapses to the mark alone, as before.
 */
function CollapsingBrand({
  brand,
  collapsed,
}: {
  brand: ResolvedHeaderBrand;
  collapsed: boolean;
}) {
  const resolveCode = brand.collapse?.code ?? null;
  const [code, setCode] = useState<HeaderBrandCode | null>(null);

  useEffect(() => {
    if (!resolveCode) return;
    setCode(toBrandCode(resolveCode()));
  }, [resolveCode]);

  const showCode = collapsed && code !== null;

  return (
    <>
      <span className="relative flex h-11 items-center">
        <BrandMark brand={brand} size={44} />
        <span
          aria-hidden={!showCode}
          className="flex h-11 items-start overflow-hidden whitespace-nowrap transition-all duration-500"
          style={{ maxWidth: showCode ? "120px" : "0px", opacity: showCode ? 1 : 0 }}
        >
          {code && (
            <span
              className="ml-1 inline-block self-start text-[36px] font-medium text-foreground transition-all duration-500 ease-in-out"
              style={{ marginTop: "-2px", ...(code.style as React.CSSProperties | undefined) }}
            >
              {code.text}
            </span>
          )}
        </span>
      </span>
      {brand.wordmark && (
        <span
          aria-hidden={collapsed}
          className="flex items-center overflow-hidden transition-all duration-500 ease-in-out"
          style={{ width: collapsed ? "0px" : "250px", opacity: collapsed ? 0 : 1 }}
        >
          <span className="flex items-center pl-2 pt-0.5">
            <Branding className="text-[60px] tracking-tighter leading-none" />
          </span>
        </span>
      )}
    </>
  );
}

// With nothing registered in either registry there is nothing to load: the
// slot is the host's own mark and wordmark, on the server and on the
// client alike, byte-for-byte what the header drew before 1.21.0. With a
// registration the declaration is resolved once per module through
// next/dynamic, so it is server-rendered with the rest of the bar (the
// lazy loader suspends until the modules are in, on both sides) and the
// wrong mark never paints first.
const UNDECLARED_BRAND = resolveHeaderBrand(null, null);
const BRAND_DECLARED = HEADER_MENU.length > 0 || SITE_METADATA.length > 0;

function UndeclaredHeaderBrand() {
  return <BrandBlock brand={UNDECLARED_BRAND} />;
}

interface HeaderBrandProps {
  /** Whether a collapsing brand has collapsed; ignored by a still one. */
  collapsed?: boolean;
}

const HeaderBrand: React.ComponentType<HeaderBrandProps> = !BRAND_DECLARED
  ? UndeclaredHeaderBrand
  : dynamic(() =>
      loadHeaderBrand().then((brand) => ({
        default: function DeclaredHeaderBrand({ collapsed }: HeaderBrandProps) {
          return <BrandBlock brand={brand} collapsed={collapsed} />;
        },
      })),
    );

/**
 * The header's own copy of the resolved brand, for the two things the bar
 * around the brand link does with a collapsing declaration (1.24.0): run
 * the collapse timer and fade the desktop nav. Nothing declared answers
 * the still brand at once, so an undeclared shell schedules no work.
 */
function useHeaderBrand(): ResolvedHeaderBrand {
  const [brand, setBrand] = useState<ResolvedHeaderBrand>(UNDECLARED_BRAND);
  useEffect(() => {
    if (!BRAND_DECLARED) return;
    let cancelled = false;
    loadHeaderBrand().then((resolved) => {
      if (!cancelled) setBrand(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return brand;
}

/**
 * rokct.ai's old header's brand motion (1.24.0), for a declared collapse:
 * `collapsed` flips `delayMs` after mount; `navVisible` is the old rule
 * verbatim - the nav shows until the brand collapses, and again while the
 * pointer is over the header or the page is scrolled past 10px. Off (no
 * listeners, no timer, nav always visible) for a still brand.
 */
function useBrandCollapse(brand: ResolvedHeaderBrand) {
  const collapse = brand.collapse;
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!collapse) return;
    const timer = setTimeout(() => setCollapsed(true), collapse.delayMs);
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [collapse]);

  return {
    collapse,
    collapsed,
    navVisible: !collapse || !collapsed || hovered || scrolled,
    onMouseEnter: collapse ? () => setHovered(true) : undefined,
    onMouseLeave: collapse ? () => setHovered(false) : undefined,
  };
}

const AUTH_LINK =
  "text-[13px] font-medium text-foreground/70 transition-colors hover:text-foreground";
const AUTH_PILL =
  "rounded-full bg-black px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black";
const AUTH_OUTLINE =
  "rounded-md border border-border px-4 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-foreground/5";
const STACKED_BUTTON =
  "block w-full rounded-2xl py-4 text-center text-lg font-bold transition-colors";

export function Header({
  loginUrl = "/login",
  signupUrl = "/register",
  dashboardUrl = "/dashboard",
  session = null,
  openLoginPopup,
  openSignupPopup,
  menuItems: menuItemsProp,
  groups: groupsProp,
  actions: actionsProp,
  nav,
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState<ResolvedHeaderMenu | null>(null);
  const pathname = usePathname();
  const panelId = useId();
  const brand = useHeaderBrand();
  const { collapse, collapsed, navVisible, onMouseEnter, onMouseLeave } =
    useBrandCollapse(brand);

  // Props win. Only a caller that passes none of the three gets the
  // registered menu loaded here.
  const selfLoad =
    menuItemsProp === undefined &&
    groupsProp === undefined &&
    actionsProp === undefined;
  const navForAnchors = useMemo(() => nav ?? [], [nav]);

  useEffect(() => {
    if (!selfLoad) return;
    let cancelled = false;
    loadHeaderMenu().then((menu) => {
      if (!cancelled) setLoaded(resolveHeaderMenu(menu, navForAnchors));
    });
    return () => {
      cancelled = true;
    };
  }, [selfLoad, navForAnchors]);

  const menuItems = menuItemsProp ?? loaded?.items ?? [];
  const groups = groupsProp ?? loaded?.groups ?? [];
  const actions = actionsProp ?? loaded?.actions ?? [];

  const user = (session as { user?: { email?: string; name?: string } } | null)
    ?.user;
  const hasMenu =
    menuItems.length > 0 || groups.length > 0 || actions.length > 0;
  // The auth links are always there to reach (Dashboard, or Log in and Sign
  // up), so the burger always has something to open. Spelled out so the
  // rule is visible: a header with no menu AND no auth would hide it.
  const hasAuth = true;
  const showBurger = hasMenu || hasAuth;

  const close = useCallback(() => setOpen(false), []);

  // Route change closes the panel.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes it; the page behind does not scroll while it is open.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const auth = user ? (
    <Link href={dashboardUrl} className={AUTH_OUTLINE}>
      {t("common.dashboard")}
    </Link>
  ) : (
    <>
      <Link href={loginUrl} onClick={openLoginPopup} className={AUTH_LINK}>
        {t("auth.login")}
      </Link>
      <Link href={signupUrl} onClick={openSignupPopup} className={AUTH_PILL}>
        {t("auth.signup")}
      </Link>
    </>
  );

  const brandLink = (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-2"
      onClick={close}
    >
      <HeaderBrand collapsed={collapsed} />
    </Link>
  );

  const desktopNav = (
    <HeaderMenuNav
      items={menuItems}
      groups={groups}
      className="hidden lg:flex"
    />
  );

  return (
    <header
      className="sticky top-0 z-50 w-full"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* The blur sits on the bar, not on <header>: a backdrop-filter makes
          its element the containing block of every fixed descendant, and
          the mobile panel below must size itself to the viewport. */}
      <div className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          {/* A collapsing brand (1.24.0) adds the chevron the old rokct.ai
              header showed after its collapsed mark, and wraps the nav so it
              can fade; a still brand renders the two exactly as before. */}
          {collapse ? (
            <div className="flex shrink-0 items-center">
              {brandLink}
              <ChevronRight
                aria-hidden="true"
                className="ml-1 h-3.5 w-3.5 text-muted-foreground transition-opacity duration-500"
                style={{ opacity: collapsed ? 1 : 0 }}
              />
            </div>
          ) : (
            brandLink
          )}

          {collapse ? (
            <div
              className="hidden h-full items-center transition-opacity duration-500 lg:flex"
              style={{
                opacity: navVisible ? 1 : 0,
                pointerEvents: navVisible ? "auto" : "none",
              }}
            >
              {desktopNav}
            </div>
          ) : (
            desktopNav
          )}

          <div className="hidden items-center gap-3 lg:flex">
            <HeaderMenuActions actions={actions} />
            <ThemeToggle className="text-muted-foreground hover:text-foreground" />
            {auth}
          </div>

          {showBurger && (
            <button
              type="button"
              className="-mr-2 p-2 text-foreground lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <X aria-hidden="true" className="h-6 w-6" />
              ) : (
                <Menu aria-hidden="true" className="h-6 w-6" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* The mobile panel: everything the bar hides below lg. */}
      <div
        id={panelId}
        hidden={!open}
        className={cn(
          "fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-background/95 px-4 pb-20 pt-2 backdrop-blur-xl lg:hidden",
        )}
      >
        <div className="flex items-center justify-between border-b border-border py-4">
          <span className="text-2xl font-bold text-foreground">
            {t("header.menu")}
          </span>
          <ThemeToggle className="text-muted-foreground hover:text-foreground" />
        </div>

        <HeaderMenuList
          items={menuItems}
          groups={groups}
          onNavigate={close}
        />

        <div className="mt-8 space-y-4">
          <HeaderMenuActions
            actions={actions}
            layout="stacked"
            onNavigate={close}
          />
          {user ? (
            <Link
              href={dashboardUrl}
              onClick={close}
              className={cn(STACKED_BUTTON, "bg-foreground/5 text-foreground")}
            >
              {t("common.dashboard")}
            </Link>
          ) : (
            <>
              <Link
                href={loginUrl}
                onClick={() => {
                  close();
                  openLoginPopup?.();
                }}
                className={cn(STACKED_BUTTON, "bg-foreground/5 text-foreground")}
              >
                {t("auth.login")}
              </Link>
              <Link
                href={signupUrl}
                onClick={() => {
                  close();
                  openSignupPopup?.();
                }}
                className={cn(
                  STACKED_BUTTON,
                  "bg-black text-white dark:bg-white dark:text-black",
                )}
              >
                {t("auth.signup")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
