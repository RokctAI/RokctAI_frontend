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

// The landing host's registry work, done ON THE SERVER (since 1.32.0; Ray,
// 2026-09-10: "hero i think should be server side if not the whole
// landing"). Until 1.31.0 the client orchestrator loaded every registered
// section, the header menu and the hero copy in effects after mount, so the
// first HTML a visitor (or a crawler) got was the header chrome and an
// empty hero frame; the words, the section headings and the header links
// arrived only once the client bundle had run. Now app/landing/page.tsx
// awaits everything here, in one place, and hands the client wrapper
// (components/custom/landing-content.tsx) resolved data and rendered
// sections: the first HTML carries the whole page.
//
// Nothing about the registries changes: a home SDK still registers each
// section, its header menu and its hero copy with one line at the marker
// of the registry that owns it, and the entries stay dynamic imports.
// Only WHERE they are awaited moves - from a client effect to the server
// render - so every rule the orchestrator applied is applied here, in the
// same order, with the same answers:
//
//  - a section whose module fails to load is logged and skipped, and the
//    page still renders;
//  - `meta.renders` is asked once, and both what the page draws and what
//    the floating nav (and so the header menu) lists come off that one
//    answer;
//  - sections render in ascending `meta.order`, registry order breaking
//    ties (Array.prototype.sort is stable); a negative order is an overlay
//    before the hero, the rest flow after it;
//  - the header menu is resolved against the very nav the floating nav
//    renders, so a header link never points at an anchor that is not on
//    the page.
//
// Because the registry is now imported ON THE SERVER, a section's ENTRY
// module (the one the registry's `load` imports) must be server-safe. A
// module that starts with "use client" is not: on the server React swaps
// every one of its exports for a client reference (a proxy tagged
// Symbol.for("react.client.reference")), so `meta.order`, `meta.nav`,
// `meta.renders` and `meta.rootClass` read as undefined (or throw) and the
// section would fall back to its module name as its id and nav label, keep
// rendering when `renders` would have dropped it, and lose its order. So
// [loadPageSection] checks `meta` before it reads it - see
// [describeMetaProblem] and [SECTION_ENTRY_CONTRACT] - and a module whose
// meta cannot be read still RENDERS, with [FALLBACK_SECTION_META] (order
// 100, the entry id as its DOM id, no floating-nav entry, always present,
// no rootClass) and one warning that names it and the contract; never
// skipped, never a crash, so a shell re-pinned to this base with a home SDK
// that has not split its entries yet keeps every section on the page
// (losing them all would be worse than 1.31). A client-reference default
// export renders fine from the server component; only meta is unreadable.
// The contract for a home SDK: the entry exports `meta`
// and the default component without "use client"; whatever needs hooks,
// state, effects, browser APIs or framer-motion lives in a sibling
// `<name>.client.tsx` that starts with "use client" and that the entry's
// default export renders; `meta.renders(ctx)` is pure (no window, no
// localStorage). The test that holds this for base's own installs is
// tests/test_manifest.py; the node suite executes the fallback.
//
// [arrangeLandingPage] is the pure rule (the loaded modules in, the page's
// shape out; the node tests execute it) and [resolveLandingPage] the loader
// the page awaits. Since 1.38.0 a section may name another page
// (`meta.page`, "about" or "team"): the landing rule keeps only landing
// sections, and [pageSectionsFor] is what a company page's renderer
// (corporate_sdk's /about, /team) awaits - the same loader, `renders` and
// order rules, filtered to its page - so a home SDK registers a card for
// a company page with the one registry line it already knows. [resolveHeroConfig] is the hero's half: HERO_CONFIG
// with the registered copy laid over it, and [resolveHeroWordmark] the
// 1.32.0 `brand` rule - what the hero's wordmark slot shows as text when a
// home SDK's copy declares `brand: "stem"` (null, the host's own wordmark
// component, for the default "name").

import {
  loadHeaderMenu,
  resolveHeaderMenu,
  brandStemLabel,
  type ResolvedHeaderMenu,
} from "@/components/custom/landing/header-menu";
import {
  HERO_CONFIG,
  type HeroConfig,
} from "@/components/custom/landing/hero-config";
import { HERO_COPY, loadHeroCopy } from "@/components/custom/landing/hero-copy";
import {
  LANDING_CONFIG,
  type LandingNavItem,
} from "@/components/custom/landing/landing-config";
import {
  DEFAULT_PAGE_SECTION_ORDER,
  DEFAULT_PAGE_SLOT,
  PAGE_SECTIONS,
  sectionPageOf,
  type PageSectionComponent,
  type PageSectionContext,
  type PageSectionEntry,
  type PageSectionMeta,
  type PageSectionModule,
  type PageSlot,
} from "@/components/custom/landing/page-sections";

/** One registered section, loaded: what the page needs to place and draw it. */
export interface LoadedSection {
  id: string;
  /** The DOM id: the first nav entry's id, else meta.anchor, else the registry id. */
  domId: string;
  order: number;
  /** The section's floating-nav entries; empty when it is not a nav stop. */
  nav: LandingNavItem[];
  Component: PageSectionComponent;
  meta: PageSectionMeta;
}

/** The page's shape, resolved: what to draw where, and the lists that go with it. */
export interface LandingPageLayout {
  /** Sections with a negative order: before the hero, outside the block that hides with it. */
  overlays: LoadedSection[];
  /** Every other section, after the hero, in page order. */
  flow: LoadedSection[];
  /** The whole floating nav in page order: hero, every present section's entries, footer. */
  navItems: LandingNavItem[];
  /** The header menu, resolved against `navItems`. */
  menu: ResolvedHeaderMenu;
  /**
   * The class names the landing root carries from the first HTML (1.32.0):
   * every present section's `meta.rootClass`, in page order, joined with
   * one space; "" when none declares one.
   */
  rootClass: string;
}

/**
 * The rule a section's entry module keeps so the server can read it; the
 * text the fallback warning carries, so the fix is named where the symptom is.
 */
export const SECTION_ENTRY_CONTRACT =
  'A landing section\'s entry module (the one the registry imports) must be server-safe: ' +
  'no "use client" directive, `meta` exported as a plain object and a default component; ' +
  "anything that needs hooks, state, effects, browser APIs or framer-motion lives in a " +
  'sibling <name>.client.tsx that starts with "use client" and that the entry\'s default ' +
  "export renders, and meta.renders(ctx) stays pure (no window, no localStorage).";

/** React's tag on a client reference: what every export of a "use client" module is on the server. */
const CLIENT_REFERENCE_TAG = Symbol.for("react.client.reference");

/** Own keys React stamps on a client reference; a value carrying either is one, whatever its typeof. */
const CLIENT_REFERENCE_KEYS = ["$$typeof", "$$id"] as const;

/**
 * Whether `value` is a client reference (React's server-side stand-in for a
 * "use client" export). Detected explicitly - the `$$typeof` tag, or the
 * `$$typeof`/`$$id` own keys - never by duck-typing what a plain meta
 * lacks, so the warning is accurate. A proxy whose traps throw for the
 * probe counts as one too: a plain object never throws on a property read.
 */
export function isClientReference(value: unknown): boolean {
  if (value === null || (typeof value !== "object" && typeof value !== "function")) {
    return false;
  }
  try {
    if ((value as { $$typeof?: unknown }).$$typeof === CLIENT_REFERENCE_TAG) return true;
    const keys = Reflect.ownKeys(value as object);
    return CLIENT_REFERENCE_KEYS.some((k) => keys.includes(k));
  } catch {
    return true;
  }
}

/**
 * What a section renders with when its module's `meta` cannot be read (or
 * is missing): the settings a section got before 1.32.0 with no meta, less
 * the nav entry - order 100, the entry id as its DOM id, no floating-nav
 * stop (a tick labelled with a module name helps nobody), always present,
 * no rootClass. A fresh object each time; the caller may not share it.
 */
export function fallbackSectionMeta(): PageSectionMeta {
  return { order: DEFAULT_PAGE_SECTION_ORDER, nav: [] };
}

/**
 * Why a module's `meta` cannot be read on the server, as a sentence, or
 * null when it can (a plain object). A client reference is named as such -
 * the module starts with "use client" - so the fix the warning points at
 * is the right one; a missing meta is named too, since the contract asks
 * the entry to export one.
 */
export function describeMetaProblem(meta: unknown): string | null {
  if (meta === undefined) return "its module exports no meta";
  if (isClientReference(meta)) {
    return (
      'its meta export is a client reference - the module starts with "use client", ' +
      "so on the server every export is a proxy and no field of meta can be read"
    );
  }
  if (meta === null || typeof meta !== "object" || Array.isArray(meta)) {
    const kind = meta === null ? "null" : Array.isArray(meta) ? "an array" : `a ${typeof meta}`;
    return `its meta export is ${kind}, not a plain object`;
  }
  const proto = Object.getPrototypeOf(meta);
  if (proto !== Object.prototype && proto !== null) {
    return "its meta export is not a plain object (it has a prototype other than Object.prototype)";
  }
  return null;
}

/**
 * Loads one registry entry into a [LoadedSection]; null, after a logged
 * error, when its module fails to load - the rule the client effect
 * applied until 1.31.0, unchanged - or (1.40.0) when it loads with no
 * default export to render: React would otherwise throw "Element type is
 * invalid" for the section at render time and the whole page would answer
 * 500, so a module that is not a component is skipped, named, and the rest
 * of the page renders. When its `meta` is not something the server can
 * read (a "use client" module's client reference proxy, a missing export,
 * any non-object) the section still loads, with [fallbackSectionMeta] and
 * one logged warning naming the module, the settings it renders with and
 * [SECTION_ENTRY_CONTRACT].
 */
export async function loadPageSection(
  entry: PageSectionEntry,
): Promise<LoadedSection | null> {
  try {
    const mod: PageSectionModule = await entry.load();
    if (typeof mod.default !== "function") {
      console.error(
        `[landing] section "${entry.id}" has no component to render: ` +
          "its module has no default export; section skipped. " +
          SECTION_ENTRY_CONTRACT,
      );
      return null;
    }
    const problem = describeMetaProblem(mod.meta);
    let meta: PageSectionMeta;
    if (problem === null) {
      meta = mod.meta as PageSectionMeta;
    } else {
      console.warn(
        `[landing] section "${entry.id}" renders with default settings ` +
          `(order ${DEFAULT_PAGE_SECTION_ORDER}, id "${entry.id}", no floating-nav entry, ` +
          `no rootClass): ${problem}. ${SECTION_ENTRY_CONTRACT}`,
      );
      meta = fallbackSectionMeta();
    }
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
}

/** Every registered section that loads, in registry order. */
export async function loadPageSections(
  entries: PageSectionEntry[] = PAGE_SECTIONS,
): Promise<LoadedSection[]> {
  const loaded = await Promise.all(entries.map(loadPageSection));
  return loaded.filter((s): s is LoadedSection => s !== null);
}

/**
 * The pure rule: the loaded sections and the page facts in, the page's
 * shape out. `meta.renders` is asked once per section, here; the sort is
 * stable, so registry order breaks an `order` tie.
 */
export function arrangeLandingPage(
  loaded: LoadedSection[],
  ctx: PageSectionContext,
  headerMenu: Parameters<typeof resolveHeaderMenu>[0],
): LandingPageLayout {
  const present = presentSectionsFor(DEFAULT_PAGE_SLOT, loaded, ctx);
  const overlays = present.filter((s) => s.order < 0);
  const flow = present.filter((s) => s.order >= 0);
  const navItems: LandingNavItem[] = [
    LANDING_CONFIG.nav.hero,
    ...present.flatMap((s) => s.nav),
    LANDING_CONFIG.nav.footer,
  ];
  const rootClass = present
    .map((s) => s.meta.rootClass?.trim() ?? "")
    .filter((c) => c.length > 0)
    .join(" ");
  const menu = resolveHeaderMenu(headerMenu, navItems);
  return {
    overlays,
    flow,
    navItems,
    menu: { ...menu, actions: dropBackendOnlyActions(menu.actions, ctx.dataMode) },
    rootClass,
  };
}

/**
 * The sections of `page`, in page order (1.38.0): the loaded sections
 * whose `meta.page` is `page` (absent means the landing page), asked
 * `meta.renders(ctx)` once each, sorted by `order` (stable, so registry
 * order breaks a tie). The one rule both the landing arrangement and
 * [pageSectionsFor] apply.
 */
export function presentSectionsFor(
  page: PageSlot,
  loaded: LoadedSection[],
  ctx: PageSectionContext,
): LoadedSection[] {
  return loaded
    .filter((s) => sectionPageOf(s.meta) === page)
    .filter((s) => s.meta.renders?.(ctx) ?? true)
    .sort((a, b) => a.order - b.order);
}

/**
 * What a company page's renderer awaits (1.38.0): every registered
 * section that names `page` in its `meta.page`, loaded through the same
 * loader as the landing's (a failing module skipped and logged, an
 * unreadable meta rendered with defaults), filtered by `meta.renders(ctx)`
 * and ordered by `meta.order`. `ctx` defaults to no plans and no session -
 * a company page prefetches nothing; the renderer passes its own when it
 * read one. Nothing registered for the page answers `[]`, and the page
 * draws its own empty state.
 */
export async function pageSectionsFor(
  page: PageSlot,
  ctx: PageSectionContext = { plans: [], session: null },
  entries: PageSectionEntry[] = PAGE_SECTIONS,
): Promise<LoadedSection[]> {
  const loaded = await loadPageSections(entries);
  return presentSectionsFor(page, loaded, ctx);
}

/**
 * The 1.35.0 `local` rule for the header's DECLARED call-to-action
 * buttons (a home SDK's `HeaderMenu.actions`): a shell that declares
 * `"data": "local"` has no backend, so an action that leads to the
 * sign-in or sign-up route (the `loginUrl` / `signupUrl` of
 * LANDING_CONFIG, the routes auth_sdk would serve) is dead surface and is
 * dropped. Every other action stays; nothing changes for "backend" and
 * "hybrid". Applied by [arrangeLandingPage] to the resolved menu, so the
 * header component itself is untouched.
 *
 * The header's OWN "Log in" / "Sign up" pair (components/custom/header.tsx,
 * the `auth` element drawn for a visitor with no session) is not a declared
 * action, so this rule does not reach it: since 1.38.0 the page hands the
 * mode it read through `siteDataMode()` to landing-content.tsx, which
 * passes it to the header as `dataMode`, and the header skips the pair
 * when `showsHeaderAuth(dataMode)` (header-menu.ts) answers false - the
 * same `local` rule, on the header's own surface.
 */
export function dropBackendOnlyActions(
  actions: ResolvedHeaderMenu["actions"],
  dataMode: PageSectionContext["dataMode"],
): ResolvedHeaderMenu["actions"] {
  if (dataMode !== "local") return actions;
  const backendOnly = new Set([LANDING_CONFIG.loginUrl, LANDING_CONFIG.signupUrl]);
  return actions.filter((action) => !backendOnly.has(action.href));
}

/** What app/landing/page.tsx awaits: every registry loaded and the page arranged. */
export async function resolveLandingPage(
  ctx: PageSectionContext,
): Promise<LandingPageLayout> {
  const [loaded, headerMenu] = await Promise.all([
    loadPageSections(),
    loadHeaderMenu(),
  ]);
  return arrangeLandingPage(loaded, ctx, headerMenu);
}

/**
 * The hero's copy, resolved: HERO_CONFIG with every registered copy module
 * laid over it in registry order. With nothing registered it is HERO_CONFIG
 * itself, and nothing is awaited.
 */
export async function resolveHeroConfig(): Promise<HeroConfig> {
  if (HERO_COPY.length === 0) return HERO_CONFIG;
  return { ...HERO_CONFIG, ...(await loadHeroCopy()) };
}

/** What the hero's wordmark slot shows as text, when it shows text at all. */
export interface HeroWordmark {
  /** The visible text: the capitalised stem of `name`, or `name` itself when it has none. */
  text: string;
  /** The full platform name, for the aria-label and title on the text. */
  name: string;
  /**
   * The rest of the name after the stem - the dot and the suffix
   * (".school" of "acme.school") - drawn after `text` in the shell's
   * primary colour when the copy declares `brand: "stem-tld"` (1.41.0).
   * Absent for `"stem"`, and for a name with no dot.
   */
  suffix?: string;
}

/**
 * The 1.32.0 `brand` rule. `"name"` (the default, and what every shell
 * drew before the field existed) answers null: the hero draws the host's
 * own wordmark component, exactly as it did. `"stem"` answers the text the
 * hero renders instead: [brandStemLabel] of `name` - the stem with its
 * first character upper-cased, since 1.39.0 ("acme.school" gives "Acme") -
 * or the whole name, untouched, when it has no stem, with the full name
 * as declared on the element's aria-label and title. `"stem-tld"`
 * (1.41.0; Ray, 2026-09-11: "also site name the .school get primary
 * color in nextjs") answers the same text and, beside it, `suffix`: the
 * rest of the trimmed name after the stem (".school"), which the hero
 * draws after the stem in the shell's primary colour; a name with no
 * stem answers what `"stem"` answers. No brand string is known here.
 */
export function resolveHeroWordmark(
  brand: HeroConfig["brand"],
  name: string,
): HeroWordmark | null {
  if (brand !== "stem" && brand !== "stem-tld") return null;
  if (brand === "stem-tld") {
    // The suffix is cut from the trimmed name at the stem's length, the
    // way header.tsx BrandStemWordmark cuts it: the stem's label and the
    // suffix together read the whole name, in its own case.
    const label = brandStemLabel(name);
    if (label !== null) return { text: label, name, suffix: name.trim().slice(label.length) };
  }
  return { text: brandStemLabel(name) ?? name, name };
}
