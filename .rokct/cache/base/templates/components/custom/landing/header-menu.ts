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

// Header-menu registry for the generic landing host
// (components/custom/landing-content.tsx).
//
// Ray, looking at the live site: "menus in header and footer are not
// injected". The footer half a home SDK can already answer by itself - its
// own footer section owns that markup, the way lms_sdk's
// lms-footer-section.tsx renders its own link row. The HEADER half it
// cannot: a home SDK has nowhere to put a header link, because the header
// is generic chrome every shell shares (base_sdk ships
// components/custom/header.tsx since 1.14.0; before that it was the host
// shell's own `requires` file). The landing host is the one thing that
// renders that header, so the seam belongs here.
//
// A home SDK installs a module whose default export is a HeaderMenu and
// registers it with ONE line at the marker below through its manifest
// integrations:
//
//   { id: "<sdk>-header-menu", load: () => import("@/components/custom/landing/<file>") },
//
// [loadHeaderMenu] answers the FIRST entry that loads (one page, one header
// menu, exactly as ./hero-form.ts picks one form and ./plans-query.ts picks
// one query). With NOTHING registered it answers `null`, the resolved menu
// is empty and the header (components/custom/header.tsx, shipped by
// base_sdk since 1.14.0) renders no navigation at all: logo, theme toggle
// and the auth links only.
//
// Since 1.14.0 the menu lives INSIDE that header - inline beside the logo
// from the `lg` breakpoint up, behind a burger button below it - rather
// than in a row under the host's own header, and a HeaderMenu may also
// name `groups` and `actions` (call-to-action buttons at the right-hand end
// of the bar).
//
// Since 1.18.0 the groups open as ONE panel, the way rokct.ai's hand-written
// header did before base shipped one (Ray, 2026-09-09: "no mega menu
// anymore" is a regression; rokct keeps everything its old header had). The
// FIRST group is the panel's lead: its label is the word on the single
// desktop trigger and its items form the panel's first column, without a
// repeated heading; every group after it is a headed column beside it. An
// item may carry a `description` and an `icon`, and one that does renders
// as a card (icon box, label, blurb) rather than a bare link - the three
// platform cards of rokct.ai's Product panel. A menu with no groups renders
// exactly as it did in 1.16.0.
//
// Since 1.21.0 the menu also carries the BRAND declaration (Ray,
// 2026-09-09: "i saw supacharge got a s logo in header, let home sdk
// declare if it needs logo there or not. supacharge text is the logo right
// now until i design an icon"). The header draws the host shell's own
// brand-logo.tsx beside the wordmark, and a shell with no icon of its own
// draws a placeholder there - supacharge-web's is the platform's first
// letter on a dark square, the "S" Ray saw. `brand.logo` lets the home SDK
// say what belongs in that slot: "none" (the wordmark IS the logo), a path
// to a real image, or "auto" (the default: the copy's registered `icon`
// from ./site-metadata.ts when there is one, else the host's own mark).
// The generated /brand-icon letter tile (app/brand-icon/route.tsx) is for
// the browser tab and the share card only and is never drawn here, not
// even when named. [resolveHeaderBrand] is the pure rule and
// [loadHeaderBrand] the loader the header renders through.
//
// Since 1.24.0 the brand declaration also says whether the host's mark
// draws its badge (`badge`: rokct.ai's BETA strip) and whether the brand
// COLLAPSES the way rokct.ai's old header did (`collapse`: the large
// wordmark slides away after load, the mark keeps the visitor's country
// code and a chevron, and the desktop nav fades until the pointer is over
// the bar or the page is scrolled). Ray, 2026-09-09: rokct.ai keeps
// everything its old host header had; a shell that declares neither draws
// the still brand it drew before. An action may also be `secondary`, the
// filled muted button that header drew its "Chat with ROK" as.
//
// Since 1.25.0 an action's icon may also be an IMAGE the shell serves
// itself (`{ src, alt }`, the shape a hero badge's icon takes) beside the
// named glyphs. Ray, 2026-09-09, on the Chrome Web Store mark rokct.ai's
// old header hot-linked from a third party's CDN: "use it but bring it
// local" - so the home SDK installs the file under public/ and names its
// path here; base never names a third-party host.
//
// Entries between the markers below are injected by the Rokct SDK installer
// (sdk_installer_base.py update_integrations()) - the same contract as
// ./hero-sections.ts, ./hero-copy.ts, ./hero-form.ts, ./plans-query.ts and
// ./page-sections.ts, and a separate file for the same reason those are:
// the installer anchors successive entries for a target file after the
// previous entry, whichever marker they named, so one file carries one
// marker and an entry is a single self-contained line with a dynamic import
// (no import statement of its own). Do not remove or reformat the marker
// comments inside the array literal.

import type {
  LandingNavBadge,
  LandingNavItem,
} from "@/components/custom/landing/landing-config";
import {
  loadSiteMetadata,
  type SiteMetadataCopy,
} from "@/components/custom/landing/site-metadata";

/**
 * One fixed destination in the header menu: a route or an external URL the
 * page does not own an anchor for.
 *
 * `label` is the word on screen, so a shell that translates its chrome
 * passes an already-translated string - this module never reaches for an
 * i18n dictionary, because which dictionary a shell uses is the shell's
 * business.
 */
export interface HeaderMenuLink {
  /** Optional stable key; the href stands in when absent. */
  id?: string;
  label: string;
  href: string;
  /** The same vocabulary a floating-nav entry uses: "new" or "soon". */
  badge?: LandingNavBadge;
  /** Open in a new tab with rel="noopener noreferrer". */
  external?: boolean;
  /**
   * One line under the label, shown on the desktop panel only (since
   * 1.18.0). An item with a description or an icon renders as a card.
   */
  description?: string;
  /** The card's icon, named from the small set the header bundles. */
  icon?: HeaderMenuIcon;
}

/**
 * The icons a menu item or action may name (since 1.18.0). A closed set,
 * resolved by components/custom/header-menu.tsx from lucide-react, so the
 * header bundles a handful of glyphs and not the whole icon library: "box"
 * (a product), "globe" (the web), "smartphone" (mobile), "message-square"
 * (chat), "zap" (automation), "wrench" (tools), "file-text" (documents)
 * and, since 1.20.0, "chrome" (lucide's own Chrome mark, for a browser
 * extension action - no third-party asset).
 */
export type HeaderMenuIcon =
  | "box"
  | "globe"
  | "smartphone"
  | "message-square"
  | "zap"
  | "wrench"
  | "file-text"
  | "chrome";

/**
 * An image icon on an action (since 1.25.0): a path the shell serves
 * itself (`/brand/marks/chrome-web-store.svg`, installed by its home SDK)
 * or an absolute URL, and the alt text. The same shape a hero badge's
 * `icon` takes (./hero-config.ts). An empty `src` draws nothing, so an
 * action never shows a broken image. Drawn as a plain <img> at the glyph
 * slot's size (20px), as the header draws a declared brand image.
 */
export interface HeaderMenuImage {
  src: string;
  alt: string;
}

/**
 * What the header's brand slot draws, as the home SDK declares it (since
 * 1.21.0):
 *
 *  - `"none"`: no image at all; the wordmark (the host's branding.tsx) is
 *    the logo. Supacharge until an icon is designed.
 *  - a path (`/images/logo.svg`, or an absolute URL): that image, 32px
 *    square, beside the wordmark.
 *  - `"auto"`, or nothing declared: a REAL icon only. The `icon` the home
 *    SDK registered in ./site-metadata.ts when there is one, else the host
 *    shell's own components/custom/brand-logo.tsx - the mark every shell
 *    rendered before this field existed, so a shell that declares nothing
 *    draws exactly what it drew. The generated `/brand-icon` letter tile is
 *    NEVER the answer here; a path naming it is treated as "auto".
 */
export type HeaderBrandLogo = "auto" | "none" | (string & {});

/** The home SDK's brand declaration for the header (since 1.21.0). */
export interface HeaderBrand {
  /** What the image slot draws; see HeaderBrandLogo. Default "auto". */
  logo?: HeaderBrandLogo;
  /**
   * Whether the wordmark (the host's branding.tsx) renders beside the
   * mark. Default true; only a shell whose image already spells its name
   * turns it off.
   */
  wordmark?: boolean;
  /**
   * Whether the host's brand-logo.tsx draws its badge on the mark (since
   * 1.24.0): rokct.ai's BETA strip, which its old header always showed.
   * Default false. A shell whose brand-logo.tsx has no badge accepts the
   * prop and draws nothing, so the flag is safe on every shell.
   */
  badge?: boolean;
  /**
   * The COLLAPSING brand rokct.ai's old header had (since 1.24.0; Ray,
   * 2026-09-09: rokct.ai keeps everything its old host header had). `true`
   * takes the defaults; an object tunes them; nothing declared keeps the
   * still brand every shell drew before. See HeaderBrandCollapse.
   */
  collapse?: boolean | HeaderBrandCollapse;
}

/**
 * How the brand slot moves after the page loads, rokct.ai's old
 * components/custom/header.tsx as the model:
 *
 *  - the mark is drawn at 44px (with its badge when `badge` is on) and the
 *    wordmark large beside it; `delayMs` after mount the wordmark slides
 *    away, a chevron appears after the mark, and the country code the
 *    resolver answers (rokct.ai: the visitor's code from its branding
 *    cache) slides in beside it;
 *  - the desktop nav fades with the wordmark and comes back while the
 *    pointer is over the header or the page is scrolled; the actions, the
 *    theme toggle and the auth links stay.
 *
 * `code` runs on the client only, once, after mount; it may answer the
 * bare text, or the text with the inline style the host wants on it (the
 * scale and baseline offset rokct.ai's branding carries). Nothing, or an
 * empty string, draws no code and the mark collapses on its own.
 */
export interface HeaderBrandCollapse {
  /** Milliseconds after mount before the wordmark slides away. Default 1500. */
  delayMs?: number;
  /** The text beside the collapsed mark, resolved on the client. */
  code?: () => HeaderBrandCode | string | null | undefined;
}

/** What [HeaderBrandCollapse.code] may answer: the text and its inline style. */
export interface HeaderBrandCode {
  text: string;
  /** Inline CSS on the text (React's CSSProperties shape), merged over the header's own. */
  style?: Record<string, string | number>;
}

/**
 * What a home SDK supplies for the header.
 *
 * `anchors` is the interesting half. It names SECTION ids, not hrefs, and
 * the host resolves each one against the nav it has already computed for
 * this render - the list that has been through every section's
 * `meta.renders` predicate. So:
 *
 *  - the label and the badge come from the `meta.nav` entry the home SDK
 *    already owns, and are never restated here (one place to edit when a
 *    section stops being new);
 *  - an id whose section did not render is DROPPED, not linked. A header
 *    link can therefore never scroll to an anchor that is not on the page -
 *    which is the whole reason the `renders` predicate was added to
 *    PageSectionMeta in the first place, and the mistake a second,
 *    hand-written list of hrefs would reintroduce.
 *
 * `links` are appended after the anchors for destinations the page has no
 * section for (a route, an app-store URL). They are taken at face value, so
 * a home SDK must only list a destination that actually resolves.
 */
export interface HeaderMenu {
  anchors?: string[];
  links?: HeaderMenuLink[];
  /**
   * Labelled columns of links, rendered after the flat entries as ONE
   * desktop panel under the first group's label (since 1.18.0; 1.14.0 to
   * 1.16.0 opened a dropdown per group). Optional; a menu that names only
   * `anchors`/`links` is resolved exactly as it was before.
   */
  groups?: HeaderMenuGroup[];
  /**
   * Call-to-action buttons at the right-hand end of the header bar, ahead
   * of the theme toggle and the auth links. Optional and new in 1.14.0.
   */
  actions?: HeaderMenuAction[];
  /**
   * How the header draws the brand (since 1.21.0; Ray, 2026-09-09: "let
   * home sdk declare if it needs logo there or not"). Optional; a menu
   * that leaves it out draws the host's own mark beside the wordmark,
   * exactly as before.
   */
  brand?: HeaderBrand;
}

/**
 * One entry of a group: a fixed link, or `{ anchor }` naming a SECTION id
 * that is resolved against the live nav the same way a top-level anchor is
 * (and dropped the same way when its section is not on the page).
 */
export type HeaderMenuGroupItem = HeaderMenuLink | { anchor: string };

/**
 * A labelled column of the header's panel. The label and badge are the
 * group's own (a group is not a section, so there is no `meta.nav` entry to
 * lift them from); its items follow the anchor and link rules above. A
 * group whose every item was dropped is dropped with them, so a label never
 * opens an empty list. The first group's label is the desktop trigger.
 */
export interface HeaderMenuGroup {
  /** Stable, unique in the menu. */
  id: string;
  label: string;
  badge?: LandingNavBadge;
  items: HeaderMenuGroupItem[];
}

/**
 * A call-to-action button in the header bar (rokct.ai's "Add the Chrome
 * extension" is the model). `primary` paints the platform's primary colour;
 * `ghost` is an outlined button; `secondary` (since 1.24.0) is the filled
 * muted button rokct.ai's old header drew its "Chat with ROK" as, in the
 * shell's secondary tokens. Taken at face value like a link.
 */
export interface HeaderMenuAction {
  /** Stable, unique in the menu. */
  id: string;
  label: string;
  href: string;
  variant?: "primary" | "ghost" | "secondary";
  /** Open in a new tab with rel="noopener noreferrer". */
  external?: boolean;
  /**
   * A glyph drawn before the label (since 1.20.0), named from the same
   * closed set as an item's, or (since 1.25.0) an image the shell serves
   * itself - rokct.ai's extension button carries the Chrome Web Store mark
   * its old header hot-linked, now at `/brand/marks/chrome-web-store.svg`.
   * Without one the button is label only, as before.
   */
  icon?: HeaderMenuIcon | HeaderMenuImage;
}

/** The shape of a registered menu module. */
export interface HeaderMenuModule {
  default: HeaderMenu | null;
}

export interface HeaderMenuEntry {
  /** Stable, unique across SDKs: "<sdk>-header-menu". */
  id: string;
  load: () => Promise<HeaderMenuModule>;
}

export const HEADER_MENU: HeaderMenuEntry[] = [
  // @rokct-sdk-header-menu-start
  // @rokct-sdk-header-menu-end
];

/**
 * One resolved entry, ready to render: an in-page anchor lifted from the
 * live nav, or a fixed link.
 */
export interface HeaderMenuItem {
  /** Unique on the row: the section id, or the link's id, else its href. */
  key: string;
  label: string;
  href: string;
  badge?: LandingNavBadge;
  external?: boolean;
  /** Carried from the link (since 1.18.0); an anchor has neither. */
  description?: string;
  icon?: HeaderMenuIcon;
}

/**
 * The menu the header should render: every named anchor that is actually on
 * the page, in the order the home SDK named them, then its fixed links.
 *
 * `nav` is the host's live nav for this render. An anchor id missing from it
 * is silently skipped - the section is not on the page, so neither is its
 * link. A `null` menu, or one that resolves to nothing, yields an empty
 * array and the host then renders no row at all.
 */
export function resolveHeaderMenuItems(
  menu: HeaderMenu | null,
  nav: LandingNavItem[],
): HeaderMenuItem[] {
  if (!menu) return [];

  const byId = new Map(nav.map((item) => [item.id, item]));
  const items: HeaderMenuItem[] = [];

  for (const id of menu.anchors ?? []) {
    const entry = byId.get(id);
    if (!entry) continue;
    items.push({
      key: id,
      label: entry.label,
      href: `#${entry.id}`,
      badge: entry.badge,
    });
  }

  for (const link of menu.links ?? []) {
    items.push({
      key: link.id ?? link.href,
      label: link.label,
      href: link.href,
      badge: link.badge,
      external: link.external,
      description: link.description,
      icon: link.icon,
    });
  }

  return items;
}

/** A group with its items resolved: ready to render as a panel column. */
export interface HeaderMenuResolvedGroup {
  id: string;
  label: string;
  badge?: LandingNavBadge;
  items: HeaderMenuItem[];
}

/** Everything the header renders, resolved against the page's live nav. */
export interface ResolvedHeaderMenu {
  /** The flat entries, as [resolveHeaderMenuItems] answers them. */
  items: HeaderMenuItem[];
  /** The panel's columns, each with at least one item; the first leads. */
  groups: HeaderMenuResolvedGroup[];
  /** The call-to-action buttons, in the order the home SDK named them. */
  actions: HeaderMenuAction[];
}

const EMPTY_HEADER_MENU: ResolvedHeaderMenu = { items: [], groups: [], actions: [] };

/**
 * The whole menu the header should render: [resolveHeaderMenuItems]'s flat
 * list, then every group with at least one item left after its anchors were
 * resolved by the same drop-missing rule, then the actions as declared.
 * A `null` menu resolves to three empty lists and the header renders no
 * navigation.
 */
export function resolveHeaderMenu(
  menu: HeaderMenu | null,
  nav: LandingNavItem[],
): ResolvedHeaderMenu {
  if (!menu) return EMPTY_HEADER_MENU;

  const byId = new Map(nav.map((item) => [item.id, item]));
  const groups: HeaderMenuResolvedGroup[] = [];

  for (const group of menu.groups ?? []) {
    const items: HeaderMenuItem[] = [];
    for (const entry of group.items) {
      if ("anchor" in entry) {
        const nav = byId.get(entry.anchor);
        if (!nav) continue;
        items.push({
          key: entry.anchor,
          label: nav.label,
          href: `#${nav.id}`,
          badge: nav.badge,
        });
      } else {
        items.push({
          key: entry.id ?? entry.href,
          label: entry.label,
          href: entry.href,
          badge: entry.badge,
          external: entry.external,
          description: entry.description,
          icon: entry.icon,
        });
      }
    }
    if (items.length === 0) continue;
    groups.push({ id: group.id, label: group.label, badge: group.badge, items });
  }

  return {
    items: resolveHeaderMenuItems(menu, nav),
    groups,
    actions: [...(menu.actions ?? [])],
  };
}

/**
 * Loads the first registered menu. An entry that fails to load is logged
 * and skipped in favour of the next one; `null` when nothing is registered
 * or nothing loads, and the header then carries no menu.
 */
export async function loadHeaderMenu(): Promise<HeaderMenu | null> {
  for (const entry of HEADER_MENU) {
    try {
      return (await entry.load()).default;
    } catch (error) {
      console.error(`[landing] failed to load header menu "${entry.id}":`, error);
    }
  }
  return null;
}

/**
 * The brand slot, resolved: `"none"` draws nothing, `"host"` draws the
 * host shell's own brand-logo.tsx, `{ src }` draws that image.
 */
export type ResolvedHeaderBrandLogo = "none" | "host" | { src: string };

/** What the header renders in its brand link, resolved by [resolveHeaderBrand]. */
export interface ResolvedHeaderBrand {
  logo: ResolvedHeaderBrandLogo;
  /** Whether the wordmark renders; true unless the home SDK said otherwise. */
  wordmark: boolean;
  /** Whether the host's mark draws its badge; false unless declared (1.24.0). */
  badge: boolean;
  /** The collapsing brand, with its defaults filled in; null for a still brand (1.24.0). */
  collapse: ResolvedHeaderBrandCollapse | null;
}

/** [HeaderBrandCollapse] with every default filled in. */
export interface ResolvedHeaderBrandCollapse {
  delayMs: number;
  code: (() => HeaderBrandCode | string | null | undefined) | null;
}

/** The wordmark slides away this long after mount unless the home SDK said otherwise. */
export const DEFAULT_BRAND_COLLAPSE_DELAY_MS = 1500;

/**
 * The collapse declaration with its defaults filled in: `true` is the
 * defaults, an object overrides them, `false` or nothing is a still brand.
 */
export function resolveHeaderBrandCollapse(
  collapse: boolean | HeaderBrandCollapse | null | undefined,
): ResolvedHeaderBrandCollapse | null {
  if (!collapse) return null;
  const declared = collapse === true ? {} : collapse;
  const delayMs =
    typeof declared.delayMs === "number" && Number.isFinite(declared.delayMs) && declared.delayMs >= 0
      ? declared.delayMs
      : DEFAULT_BRAND_COLLAPSE_DELAY_MS;
  return { delayMs, code: typeof declared.code === "function" ? declared.code : null };
}

/**
 * The generated favicon route base_sdk installs at app/brand-icon/route.tsx
 * (app/lib/site-metadata.ts's GENERATED_BRAND_ICON, restated here because
 * that module reaches for node:fs and this one is bundled for the
 * browser). The letter tile is for the tab and the share card only.
 */
const GENERATED_BRAND_ICON_PATH = "/brand-icon";

/** True for the generated letter tile, as a path or behind any origin. */
export function isGeneratedBrandIcon(path: string): boolean {
  const bare = path.trim().replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]+/i, "");
  return (
    bare === GENERATED_BRAND_ICON_PATH ||
    bare.startsWith(`${GENERATED_BRAND_ICON_PATH}?`) ||
    bare.startsWith(`${GENERATED_BRAND_ICON_PATH}/`)
  );
}

/**
 * The pure rule for the header's brand slot (since 1.21.0). `brand` is the
 * home SDK's declaration (the menu's `brand`, or nothing when no menu is
 * registered or it declares none); `copy` is the registered site-metadata
 * copy, of which only `icon` matters, or null when it was not loaded.
 *
 *  - `logo: "none"` answers no image.
 *  - an explicit path answers that path, unless it names the generated
 *    /brand-icon tile, which falls through to the "auto" rule.
 *  - `"auto"` (or nothing) answers the copy's `icon` when it is a real one,
 *    else "host": the host shell's own brand-logo.tsx.
 *
 * The generated tile is never the answer, whatever was declared. `badge`
 * and `collapse` (1.24.0) are carried through with their defaults filled
 * in, whichever branch answers the logo.
 */
export function resolveHeaderBrand(
  brand: HeaderBrand | null | undefined,
  copy: Pick<SiteMetadataCopy, "icon"> | null | undefined,
): ResolvedHeaderBrand {
  const wordmark = brand?.wordmark !== false;
  const badge = brand?.badge === true;
  const collapse = resolveHeaderBrandCollapse(brand?.collapse);
  const declared = brand?.logo?.trim() ?? "";
  if (declared === "none") return { logo: "none", wordmark, badge, collapse };
  if (declared && declared !== "auto" && !isGeneratedBrandIcon(declared)) {
    return { logo: { src: declared }, wordmark, badge, collapse };
  }
  const icon = copy?.icon?.trim() ?? "";
  if (icon && !isGeneratedBrandIcon(icon)) {
    return { logo: { src: icon }, wordmark, badge, collapse };
  }
  return { logo: "host", wordmark, badge, collapse };
}

/** True when the declaration needs the registered copy to resolve. */
export function headerBrandNeedsCopy(brand: HeaderBrand | null | undefined): boolean {
  const declared = brand?.logo?.trim() ?? "";
  return declared === "" || declared === "auto" || isGeneratedBrandIcon(declared);
}

/**
 * Loads the registered menu's brand declaration and, only when the rule
 * needs it (nothing declared, "auto", or the refused tile), the registered
 * site-metadata copy, and answers [resolveHeaderBrand]. Never throws: a
 * copy that fails to load is logged and the host's own mark is drawn, so
 * the header always renders.
 */
export async function loadHeaderBrand(): Promise<ResolvedHeaderBrand> {
  const brand = (await loadHeaderMenu())?.brand ?? null;
  let copy: Pick<SiteMetadataCopy, "icon"> | null = null;
  if (headerBrandNeedsCopy(brand)) {
    try {
      copy = await loadSiteMetadata();
    } catch (error) {
      console.error("[landing] failed to load the site copy for the header brand:", error);
    }
  }
  return resolveHeaderBrand(brand, copy);
}
