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
// Since 1.28.0 a collapsing brand with NO image (`logo: "none"`) folds
// into a letter tile rather than into nothing (Ray, 2026-09-10: "since
// supacharge has not icon cant it fold and only leave the first letter as
// its icon?"): [BrandLetterTile], the platform name's first letter in the
// shell's primary colour on the dark ground the generated /brand-icon tab
// tile uses, 44px like a mark, drawn in CSS - no image, no fetch - and
// only while the brand is collapsed. The still brand, a declared image and
// the host's own mark are untouched; a shell that declares no `collapse`
// renders exactly what it rendered.
//
// Since 1.29.0 an icon-less collapsing brand whose platform name carries a
// dot folds to its STEM instead (Ray, 2026-09-10: "if sitename has a dot,
// fold dot and what comes after so the s will never show anymore unless
// there is icon, if there is icon it fold further to leave only icon"):
// [BrandStemWordmark] draws the whole name at load in the large
// wordmark's classes and after `delayMs` slides the dot and what follows
// it away, leaving the text before the first dot as the wordmark with the
// code and the chevron beside it. The letter tile is never drawn for a
// dotted name; a brand with an image still folds to that image whatever
// its name, and an undotted icon-less name still folds to the 1.28.0 tile.
//
// Since 1.31.0 the code beside a stem is sized with the stem
// ([BRAND_STEM_CODE_FONT_SIZE]: its cap, or the stem's size where that
// is smaller) and laid out as the stem is, so on a phone it sits on the
// stem's baseline and is never larger than the wordmark - as the code is
// never larger than the 44px mark it sits beside on rokct.ai.
//
// Since 1.36.0 the code beside a STEM is capped at the size rokct.ai's
// ORIGINAL header rendered its code at: the superscript scale of its
// branding (BRAND_CODE_SCALE, 0.28) of the 44px mark - BRAND_CODE_FONT_SIZE,
// about 12px - not the 36px that header named inline and then overrode
// with the branding cache's style (Ray, 2026-09-10: "za in supa is big,
// look at one in rokct, original one"). The code beside a MARK or a tile
// is byte-for-byte the 1.24.0 code - rokct.ai's renders exactly as it
// did (Ray: "if i merge that one it will change country code in rokct to
// wrong one"); only the stem branch, which no mark shell reaches, takes
// the new cap. The trigger word of the groups panel may also be the
// menu's own since 1.36.0 (`megaLabel`, carried through to HeaderMenuNav).
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
//
// Since 1.38.0 the header's own "Log in" / "Sign up" pair follows the
// shell's data mode (the 1.35.0 `local` rule, which until now reached only
// the DECLARED actions through landing-page.ts): with `dataMode="local"` -
// passed by landing-content.tsx from the mode the page read through
// siteDataMode() - a visitor with no session gets no pair, on the bar and
// in the burger panel (showsHeaderAuth in landing/header-menu.ts). A
// caller that passes no mode, every page that mounted the header before,
// draws exactly what it drew.

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
  BRAND_STEM_CODE_FONT_SIZE,
  BRAND_STEM_FONT_SIZE,
  HEADER_MENU,
  brandFoldsToLetter,
  brandFoldsToStem,
  brandStemLabel,
  brandLetterOf,
  brandStemOf,
  loadHeaderBrand,
  loadHeaderMenu,
  resolveHeaderBrand,
  resolveHeaderMenu,
  showsHeaderAuth,
  type HeaderBrandCode,
  type HeaderMenuAction,
  type HeaderMenuItem,
  type HeaderMenuResolvedGroup,
  type ResolvedHeaderBrand,
  type ResolvedHeaderMenu,
} from "@/components/custom/landing/header-menu";
import type { LandingNavItem } from "@/components/custom/landing/landing-config";
import { SITE_METADATA } from "@/components/custom/landing/site-metadata";
import type { SiteDataMode } from "@/lib/site-data/kinds";
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
   * The groups panel's trigger word, as resolveHeaderMenu() answers it
   * (1.36.0): the menu's declared `megaLabel`, or null for the first
   * group's label. Read only with `groups`.
   */
  megaLabel?: string | null;
  /**
   * The page's live nav, used only when the header loads the menu itself
   * (no menuItems/groups/actions given) to resolve anchors. A page without
   * sections leaves it out and the anchors are dropped.
   */
  nav?: LandingNavItem[];
  /**
   * The shell's data mode (1.38.0; base 1.35.0's composer.json `"data"`),
   * as the page read it through `siteDataMode()`. "local" skips the
   * header's own Log in / Sign up pair for a visitor with no session (a
   * local shell has no backend to sign in to); absent, "backend" and
   * "hybrid" draw it as before.
   */
  dataMode?: SiteDataMode;
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
 * The ground of the generated /brand-icon tab tile (app/brand-icon/
 * route.tsx's GROUND, restated because that route is a node module), with
 * its top-right highlight. Not a brand colour: the same near-black in
 * both themes, so the tile reads as the tab's icon does. The letter takes
 * the shell's primary token.
 */
const BRAND_TILE_GROUND = "#0b0b0b";
const BRAND_TILE_HIGHLIGHT =
  "radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0) 55%)";
/** The tab tile's proportions at 44px: corners at 22%, the face at 84% (cap height near 62%). */
const BRAND_TILE_SIZE = 44;
const BRAND_TILE_FONT_PX = Math.round(BRAND_TILE_SIZE * 0.84);

/**
 * The letter tile a collapsing brand with no image folds into (1.28.0):
 * `name`'s first letter or digit, uppercased, in the primary colour on the
 * tab tile's dark ground, 44px square with the tab tile's corners. Pure
 * CSS and text - no <img>, nothing fetched. Its slot opens with the
 * collapse, the way the code's does, so at load the wordmark stands
 * alone as the declaration says and after `delayMs` the name folds into
 * the letter. A name with no letter draws nothing.
 */
function BrandLetterTile({ name, collapsed }: { name: string; collapsed: boolean }) {
  const letter = brandLetterOf(name);
  if (!letter) return null;
  return (
    <span
      aria-hidden={!collapsed}
      className="flex h-11 shrink-0 items-center overflow-hidden transition-all duration-500 ease-in-out"
      style={{ maxWidth: collapsed ? `${BRAND_TILE_SIZE}px` : "0px", opacity: collapsed ? 1 : 0 }}
    >
      <span
        role="img"
        aria-label={name}
        className="flex h-11 w-11 shrink-0 select-none items-center justify-center rounded-[22%] font-bold leading-none text-primary"
        style={{
          backgroundColor: BRAND_TILE_GROUND,
          backgroundImage: BRAND_TILE_HIGHLIGHT,
          fontSize: `${BRAND_TILE_FONT_PX}px`,
        }}
      >
        {letter}
      </span>
    </span>
  );
}

/**
 * The wordmark a collapsing brand with no image and a DOTTED name folds
 * into (1.29.0): `stem`, the text before the first dot, then the dot and
 * the rest of `name` in a slot that closes with the collapse. Text only,
 * in the large wordmark's classes (the ones the Branding slot below
 * takes) and the host wordmarks' bold weight, in the foreground token, so at
 * load the whole name reads as one word and after `delayMs` only the stem
 * is left, the code and the chevron beside it. No letter tile, no image.
 * The size is responsive ([BRAND_STEM_FONT_SIZE]): the large wordmark's
 * 60px when the whole name fits, smaller when it would not, so a long
 * dotted name never pushes the bar past the viewport before the fold
 * nor the burger off a phone after it.
 *
 * The suffix SLIDES into the stem the way the large wordmark slides into
 * the mark (Ray, 2026-09-10: "its like its being erased but not as a back
 * type but like sliding into what gets left. i think rokct already use
 * the animation in header"): the same 500ms ease-in-out as that slot, its
 * width closing over hidden overflow while the stem's glyphs never move -
 * not a backspace, not a swap. The slot is a one-column grid whose track
 * goes from `1fr` to `0fr`, so it closes from the suffix's own width, the
 * whole transition visible, with nothing measured.
 */
function BrandStemWordmark({
  name,
  stem,
  collapsed,
}: {
  name: string;
  stem: string;
  collapsed: boolean;
}) {
  const suffix = name.trim().slice(stem.length);
  // What the stem span shows (1.39.0): the stem with its first character
  // upper-cased ([brandStemLabel]; "acme.school" folds to "Acme"). The
  // suffix is still cut from the name at the stem's length, and the
  // title on the wordmark is the full name as declared, so nothing but
  // the one displayed character changes case.
  const label = brandStemLabel(name) ?? stem;
  // One size for the whole name, set on this span so the stem and the
  // suffix inherit it: the 60px of the large wordmark when the FULL name
  // fits the bar, else what fits ([BRAND_STEM_FONT_SIZE], from the name's
  // character count and the viewport), so the name never widens the bar
  // and the stem's glyphs are the same before and after the fold.
  const size = { "--brand-chars": name.trim().length, fontSize: BRAND_STEM_FONT_SIZE } as React.CSSProperties;
  // The face (1.40.0; Ray, 2026-09-11: the header's stem wordmark was in a
  // different font from the hero's and the footer's): the stem wordmark
  // here and the hero's (hero-view.tsx HeroWordmarkSlot) carry the SAME
  // font utilities - bold, tracking-tighter, leading-none, and NO family
  // of their own, so both inherit the face the shell's root declares -
  // and the same `data-brand-wordmark="stem"` hook, so a home SDK that
  // gives its wordmark a face of its own styles both with ONE rule
  // ([data-brand-wordmark="stem"]) instead of reaching one and not the
  // other. The code span beside it keeps its own font-medium at its
  // 1.36.0 cap. tests/test_manifest.py holds the two class lists equal.
  return (
    <span
      title={name.trim()}
      data-brand-wordmark="stem"
      className="flex shrink-0 items-center whitespace-nowrap pt-0.5 font-bold tracking-tighter leading-none text-foreground"
      style={size}
    >
      <span>{label}</span>
      <span
        aria-hidden={collapsed}
        className="grid transition-all duration-500 ease-in-out"
        style={{ gridTemplateColumns: collapsed ? "0fr" : "1fr", opacity: collapsed ? 0 : 1 }}
      >
        <span className="min-w-0 overflow-hidden">{suffix}</span>
      </span>
    </span>
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
 * A brand with no image (`logo: "none"`, 1.28.0) has no mark to keep, so
 * the letter tile stands in that slot once collapsed - unless the name
 * has a dot (1.29.0), when the stem wordmark stands there instead and the
 * large wordmark slot is not drawn at all: the name IS the wordmark, and
 * only its dot and suffix fold away.
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
  // The stem rule is asked first: a dotted name never reaches the tile.
  const stem = brandFoldsToStem(brand, PLATFORM_NAME) ? brandStemOf(PLATFORM_NAME) : null;
  // Beside a stem (1.31.0) the code is laid out as the stem is - centred,
  // leading-none, the same top padding - at the stem's size or the code's
  // cap, whichever is smaller (BRAND_STEM_CODE_FONT_SIZE, with the same
  // --brand-chars), so it sits on the stem's baseline and never outgrows
  // it on a phone (1.36.0: that cap is the original header's superscript
  // size, about 12px, no longer 36px). Beside a mark or a tile it is the
  // 1.24.0 code, untouched: rokct.ai's renders exactly as it did.
  const codeClassName =
    stem !== null
      ? "ml-1 inline-block self-center pt-0.5 font-medium leading-none text-foreground transition-all duration-500 ease-in-out"
      : "ml-1 inline-block self-start text-[36px] font-medium text-foreground transition-all duration-500 ease-in-out";
  const codeStyle: React.CSSProperties =
    stem !== null
      ? ({ "--brand-chars": PLATFORM_NAME.trim().length, fontSize: BRAND_STEM_CODE_FONT_SIZE } as React.CSSProperties)
      : { marginTop: "-2px" };

  return (
    <>
      <span className="relative flex h-11 items-center">
        {stem !== null ? (
          <BrandStemWordmark name={PLATFORM_NAME} stem={stem} collapsed={collapsed} />
        ) : brandFoldsToLetter(brand) ? (
          <BrandLetterTile name={PLATFORM_NAME} collapsed={collapsed} />
        ) : (
          <BrandMark brand={brand} size={44} />
        )}
        <span
          aria-hidden={!showCode}
          className="flex h-11 items-start overflow-hidden whitespace-nowrap transition-all duration-500"
          style={{ maxWidth: showCode ? "120px" : "0px", opacity: showCode ? 1 : 0 }}
        >
          {code && (
            <span
              className={codeClassName}
              style={{ ...codeStyle, ...(code.style as React.CSSProperties | undefined) }}
            >
              {code.text}
            </span>
          )}
        </span>
      </span>
      {brand.wordmark && stem === null && (
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
  megaLabel: megaLabelProp,
  actions: actionsProp,
  nav,
  dataMode,
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
  // 1.36.0: the trigger word rides with the groups it names.
  const megaLabel = groupsProp !== undefined ? (megaLabelProp ?? null) : (loaded?.megaLabel ?? null);

  const user = (session as { user?: { email?: string; name?: string } } | null)
    ?.user;
  const hasMenu =
    menuItems.length > 0 || groups.length > 0 || actions.length > 0;
  // The auth links are there to reach (Dashboard, or Log in and Sign up)
  // unless the shell is local (1.38.0: no backend, no pair for a visitor
  // with no session), so the burger has something to open whenever there
  // is anything. Spelled out so the rule is visible: a header with no menu
  // AND no auth hides it.
  const hasAuth = !!user || showsHeaderAuth(dataMode);
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

  // 1.38.0: a local shell draws no pair for a visitor with no session.
  const auth = user ? (
    <Link href={dashboardUrl} className={AUTH_OUTLINE}>
      {t("common.dashboard")}
    </Link>
  ) : !hasAuth ? null : (
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
      megaLabel={megaLabel}
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
          ) : !hasAuth ? null : (
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
