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

// The shell's host-owned `data/` folder: its kinds, their shapes, and the
// one rule that decides what a reader gets (since base_sdk 1.35.0; Ray,
// 2026-09-10: "do you think we need a data folder for non backend shells?
// so if the folder exist sdks read it?" - "but dont the shell need to
// anounce im local so it look for data/ first?" - "what we cant give sdk
// we can give data/").
//
// A shell that has no backend, or that wants some of its content to live
// with the site rather than in a backend, commits a `data/` folder and
// ANNOUNCES how it is to be read with one top-level key in its own
// composer.json: `"data": "local" | "backend" | "hybrid"` (absent is
// "backend", today's behaviour, byte for byte). `lib/site-data/generate.mjs`
// reads both at BUILD time and writes `lib/site-data/generated.ts`, the
// module every reader imports - so the files are bundled with the app and
// nothing reads the disk at request time (Vercel's functions have no
// `data/` to read). This file is the pure half: the kinds and their types,
// the rule (`resolveSiteData`), no filesystem, no `server-only`, so it is
// importable from anywhere (a client component may import the types) and
// executable under node's test runner.
//
// The brand name is not in data/ for a shell whose home SDK carries the
// brand (its site-metadata copy and the host's PLATFORM_NAME). Since 1.53.0
// a site whose WHOLE page is data - a local-data site, whose home SDK is
// corporate_sdk - declares its name, its page and its look here too:
// data/site.json, data/sections.json, data/pricing.json, data/order.json,
// data/site.css and the theme's palette and fonts (Ray, 2026-10-31: one
// shared site renderer, every client from data, no SDK per client).

/** How the shell wants its data read; declared in composer.json `"data"`. */
export type SiteDataMode = "local" | "backend" | "hybrid";

export const SITE_DATA_MODES: readonly SiteDataMode[] = ["local", "backend", "hybrid"];

/** What an absent `"data"` key means: today's behaviour, no file is ever read. */
export const DEFAULT_SITE_DATA_MODE: SiteDataMode = "backend";

/**
 * The palette tokens a local-data site's theme may set (1.53.0): hex
 * colours, except `shadow`, a CSS box-shadow. The home SDK maps them to its
 * own CSS variables and derives the shadcn tokens (--background,
 * --primary, ...) from them.
 */
export type SitePaletteToken =
  | "paper" | "card" | "alt" | "stroke" | "sub" | "ink" | "sec" | "faint"
  | "brand" | "brandHi" | "brandDeep" | "brandDark" | "brandText" | "bandInk"
  | "highlight" | "highlightInk" | "ok" | "onBrand" | "heroTop" | "heroLow"
  | "shade" | "primary" | "shadow";

export type SitePalette = Partial<Record<SitePaletteToken, string>>;

/** The display faces a theme may choose (1.53.0), a small allowed set. */
export type SiteDisplayFont = "montserrat" | "fraunces" | "space-grotesk" | "playfair-display";
/** The text faces a theme may choose (1.53.0). */
export type SiteTextFont = "figtree" | "inter" | "dm-sans";

/**
 * `data/theme.json` `backToTop` (1.56.0): the shell's own settings for the
 * floating Back to top button, laid over its home SDK's registered style.
 * The same shape as BackToTopConfig in
 * components/custom/landing/back-to-top.ts (kept separate so this module
 * imports nothing); validated by ./validate-site.mjs validateBackToTop.
 */
export interface SiteBackToTop {
  enabled?: boolean;
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  icon?: "arrow-up" | "arrow-up-circle" | "chevron-up" | "rocket";
  shape?: "circle" | "rounded-square" | "pill-with-label" | "text-arrow";
  label?: string;
  background?: string;
  foreground?: string;
  hoverBackground?: string;
  hoverForeground?: string;
  border?: string;
  ring?: string;
  halo?: string;
  offset?: number;
  showAfter?: number;
  radius?: string;
  size?: string;
  fontFamily?: string;
  fontWeight?: string | number;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  letterSpacing?: string;
  fontSize?: string;
  borderWidth?: string;
  borderStyle?: "solid" | "dashed" | "dotted" | "double" | "none";
  shadow?: string;
  duration?: string;
  easing?: string;
}

/** `data/theme.json`: the shell's colours, as hex strings (`#rgb` or `#rrggbb`). */
export interface SiteTheme {
  primary: string;
  secondary?: string;
  accent?: string;
  /** Light-scheme palette tokens (1.53.0). */
  palette?: SitePalette;
  /** Dark-scheme overrides of `palette` (1.53.0). */
  paletteDark?: SitePalette;
  /**
   * The two faces (1.53.0), from the allowed set, and the display face's
   * voice: its weight, italic or not, set in capitals or not.
   */
  fonts?: {
    display?: SiteDisplayFont;
    text?: SiteTextFont;
    displayWeight?: 400 | 500 | 600 | 700 | 800 | 900;
    displayItalic?: boolean;
    displayUppercase?: boolean;
  };
  /** The Back to top button's settings (1.56.0). */
  backToTop?: SiteBackToTop;
}

/** One link on a team member's card. */
export interface SiteLink {
  label: string;
  href: string;
}

export interface SiteTeamMember {
  name: string;
  role: string;
  /** A public path (`/team/name.jpg`) or an absolute URL. */
  photo?: string;
  links?: SiteLink[];
}

/** `data/team.json`. */
export interface SiteTeam {
  members: SiteTeamMember[];
}

export interface SiteStockist {
  name: string;
  address: string;
  town: string;
  lat?: number;
  lng?: number;
  /** A public maps link for the place; the site draws no map of its own. */
  mapsUrl?: string;
}

/** `data/stockists.json`. */
export interface SiteStockists {
  items: SiteStockist[];
}

export interface SiteProduct {
  name: string;
  description?: string;
  sizes?: string[];
  /** A public path or an absolute URL. */
  image?: string;
  /** "active" (the default when absent) is on sale; "coming" is announced. */
  status?: "active" | "coming";
}

/** `data/products.json`. */
export interface SiteProducts {
  items: SiteProduct[];
}

/** `data/about.md`: the file's markdown, verbatim. */
export type SiteAbout = string;

/** One page under `data/legal/<slug>.md`. */
export interface SiteLegalPage {
  /**
   * From a `title:` line in the file's front matter, else the file's
   * first level-1 heading (which is then removed from `markdown` so a
   * renderer that draws the title does not draw it twice).
   */
  title: string;
  markdown: string;
}

/** `data/legal/`: slug (the file name without `.md`) to page. */
export type SiteLegal = Record<string, SiteLegalPage>;

/**
 * One site of the network strip (`data/network.json`, since 1.40.0): the
 * same shape as `NetworkSite` in
 * components/custom/landing/network-sites.ts, written out here so this
 * seam imports nothing from the components. `url` is the site's https
 * origin (no path, query or fragment), or null for an entry that has no
 * domain yet, which must then be `shown: false`.
 */
export interface SiteNetworkSite {
  key: string;
  name: string;
  url: string | null;
  /** An absolute URL, or a public path on this shell, to the light-theme mark. */
  logo?: string;
  /** Its dark-theme twin. */
  logoDark?: string;
  /** The name IS the logo: drawn as text even with a logo path. */
  wordmark?: boolean;
  /** Default true; false keeps the entry off every strip. */
  shown?: boolean;
}

/**
 * `data/network.json`: the sites the network strip draws on a shell whose
 * home SDK registers none, and the heading over them (the strip's default
 * when absent). A shell with neither shows no strip.
 */
export interface SiteNetwork {
  heading?: string;
  sites: SiteNetworkSite[];
}

/**
 * A link in site data (1.53.0). `href` is "whatsapp" (a chat with the
 * site's WhatsApp number), an in-page `#anchor`, a `/path` or an http(s) URL.
 */
export interface SiteDataLink {
  label: string;
  href: string;
}

/** `data/site.json` (1.53.0): a local-data site's identity. */
/** How the order form is sent: unset (default) offers every channel the site has: email, plus WhatsApp when site.whatsapp is set. "email" or "whatsapp" turns the other off; "both" requires site.whatsapp. */
export type SiteOrderVia = "email" | "whatsapp" | "both";

export interface SiteIdentity {
  name: string;
  /** The wordmark as type: a heavy `lead` (with an optional `mark` such as "®") over a light `rest`. */
  wordmark?: { lead: string; mark?: string; rest?: string };
  motto?: string;
  place?: string;
  since?: string;
  /** `number`: international digits ("27150006069"); `display`: as printed ("015 000 6069"). */
  whatsapp?: { number: string; display: string };
  /**
   * (1.57.0) Where the order form goes. `orders` overrides the address;
   * without it the address is orders@`domain`, or orders@ the site's own host.
   */
  email?: { orders?: string; domain?: string; orderVia?: SiteOrderVia };
  /** `wordmark` (1.59.0): false when the `logo` image already spells the name, so the header draws the image alone. */
  header?: { logo?: "none" | "auto" | (string & {}); wordmark?: boolean; action?: SiteDataLink };
  metadata: {
    title: string;
    tagline?: string;
    description: string;
    keywords?: string[];
    themeColor?: string;
    locale?: string;
    icon?: string;
  };
  /** `links` absent: one link per section with a nav label. */
  /**
   * The footer: its links (else one per section with a nav label), a line
   * under the motto, and `legal`, the legal holder. Since 1.54.0 the
   * footer's copyright line is the site credit, which names the site
   * (`name`), so no shipped footer draws `legal`; it stays valid data.
   * `logo` (1.59.0): an image the footer draws in place of the type wordmark.
   */
  footer?: { links?: SiteDataLink[]; line?: string; legal?: string; logo?: string };
}

/** A label on a bottle: drawn from `name`/`sub`, or an `art` image (a public SVG/PNG) laid on the label. */
export interface SiteLabel {
  bg: string;
  fg?: string;
  name?: string;
  sub?: string;
  footer?: string;
  art?: string;
  /** (1.59.0) A monogram of one or two characters, drawn in a ring above the name. */
  mark?: string;
}

/** A section's picture (1.53.0): the drawn bottle wearing a label, or the site's own image file. */
export type SiteArt =
  | {
      kind: "bottle";
      size?: "500 ml" | "1.25 L";
      label: SiteLabel;
      /** (1.59.0) More labels the bottle rolls through after `label`, one at a time. */
      labels?: SiteLabel[];
      cap?: string;
    }
  | { kind: "image"; src: string; alt: string; width?: number; height?: number };

export type SiteSectionTone = "paper" | "alt" | "ink" | "brand";

interface SiteSectionBase {
  /** The DOM id, and the anchor the header and footer link to. */
  id?: string;
  /** The label of the section's header and footer link; needs `id`. */
  nav?: string;
  variant?: string;
  tone?: SiteSectionTone;
}

export interface SiteHeroSection extends SiteSectionBase {
  type: "hero";
  variant?: "poster" | "split";
  eyebrow?: string;
  lines: string[];
  accentLine?: number;
  lede?: string;
  cta?: SiteDataLink;
  secondary?: SiteDataLink;
  facts?: string[];
  tag?: { price: string; text?: string };
  art?: { back?: SiteArt; front?: SiteArt };
}

export interface SiteIntroSection extends SiteSectionBase {
  type: "intro";
  variant?: "stamp" | "plain";
  year?: string;
  text: string;
  stamp?: { lines: string[]; center?: string };
}

export type SiteStepIcon = "upload" | "label" | "truck" | "chat" | "star" | "check";

export interface SiteStepsSection extends SiteSectionBase {
  type: "steps";
  variant?: "band" | "cards";
  eyebrow?: string;
  heading: string;
  steps: { title: string; text?: string; icon?: SiteStepIcon }[];
}

export interface SitePricingSection extends SiteSectionBase {
  type: "pricing";
  variant?: "cards";
  eyebrow?: string;
  heading: string;
  note?: string;
  own?: { eyebrow?: string; heading: string; text?: string; art?: SiteArt };
}

export interface SiteGallerySection extends SiteSectionBase {
  type: "gallery";
  variant?: "shelf" | "grid";
  eyebrow?: string;
  heading: string;
  blurb?: string;
  items: { title: string; text?: string; art: SiteArt }[];
}

export interface SiteFactsSection extends SiteSectionBase {
  type: "facts";
  variant?: "band" | "plain";
  eyebrow?: string;
  heading: string;
  blurb?: string;
  stats?: { label: string; value: string }[];
  table?: { heading: string; note?: string; rows: { name: string; symbol?: string; value: string }[] };
  chain?: { label: string; value: string }[];
}

export interface SiteOrderSection extends SiteSectionBase {
  type: "order";
  variant?: "card";
  eyebrow?: string;
  heading: string;
  blurb?: string;
}

export interface SiteContactSection extends SiteSectionBase {
  type: "contact";
  variant?: "band" | "plain";
  eyebrow?: string;
  heading: string;
  blurb?: string;
  note?: string;
  card?: { label: string; action: string };
}

export type SiteSection =
  | SiteHeroSection
  | SiteIntroSection
  | SiteStepsSection
  | SitePricingSection
  | SiteGallerySection
  | SiteFactsSection
  | SiteOrderSection
  | SiteContactSection;

export type SiteSectionType = SiteSection["type"];

/** `data/sections.json` (1.53.0): the page, top to bottom; a hero, when there is one, comes first. */
export interface SiteSections {
  sections: SiteSection[];
}

export interface SitePriceTier {
  name: string;
  price: string;
  unit?: string;
  detail?: string;
  best?: boolean;
  /** The smallest quantity this tier applies to; the order form picks the tier with the highest minQty not above the quantity. */
  minQty?: number;
  /** The line under the price in the order form's preview. */
  previewNote?: string;
  /** (1.59.0) A small line under `detail`; `strong` is drawn bold before `text`. */
  fine?: { strong?: string; text: string };
  /** (1.59.0) A picture drawn in the card beside its words, the card's full height. */
  art?: SiteArt;
  /** (1.59.0) A quantity range with a running total; see SitePriceSlider. */
  slider?: SitePriceSlider;
}

/**
 * (1.59.0) A tier's quantity slider, `min` to `max` (`step`, default 1).
 * `count`, `breakdown` and `total` are templates over `{n}` (the quantity),
 * `{units}` (n x perCase), `{price}` (the tier's price), `{each}` (price /
 * perCase) and `{total}` (n x price); `label` names the range and `total`
 * names the running total.
 */
export interface SitePriceSlider {
  min: number;
  max: number;
  step?: number;
  label: string;
  count?: string;
  total?: string;
  breakdown?: string;
}

/** `data/pricing.json` (1.53.0). */
export interface SitePricing {
  tiers: SitePriceTier[];
  /** (1.59.0) Units in one case (24 bottles), for `{units}` and `{each}` in a tier's words. */
  perCase?: number;
  ctaLabel?: string;
  bestLabel?: string;
}

export interface SiteOrderField {
  label: string;
  placeholder?: string;
  button?: string;
}

/** `data/order.json` (1.53.0): the order form, sent by email (see order-email.ts); see validate-site.mjs validateOrder. */
export interface SiteOrder {
  intro: string;
  fields: {
    business: SiteOrderField;
    quantity: SiteOrderField;
    phone: SiteOrderField;
    area: SiteOrderField;
    file?: SiteOrderField;
  };
  message: {
    business: string;
    quantity: string;
    quantityPrice?: string;
    area: string;
    phone: string;
    fileSent?: string;
    fileLater?: string;
  };
  submit: string;
  fine?: string;
  preview?: { heading?: string; placeholderName: string; label: SiteLabel };
}

/** `data/site.css` (1.53.0): the site's own stylesheet, verbatim. */
export type SiteCss = string;

/** Every kind, keyed by the name a reader asks for. */
export interface SiteDataKinds {
  theme: SiteTheme;
  team: SiteTeam;
  stockists: SiteStockists;
  products: SiteProducts;
  about: SiteAbout;
  legal: SiteLegal;
  network: SiteNetwork;
  site: SiteIdentity;
  sections: SiteSections;
  pricing: SitePricing;
  order: SiteOrder;
  css: SiteCss;
}

export type SiteDataKind = keyof SiteDataKinds;

export const SITE_DATA_KINDS: readonly SiteDataKind[] = [
  "theme",
  "team",
  "stockists",
  "products",
  "about",
  "legal",
  "network",
  "site",
  "sections",
  "pricing",
  "order",
  "css",
];

/** Where each kind lives under the shell root, as the error messages name it. */
export const SITE_DATA_FILES: Readonly<Record<SiteDataKind, string>> = {
  theme: "data/theme.json",
  team: "data/team.json",
  stockists: "data/stockists.json",
  products: "data/products.json",
  about: "data/about.md",
  legal: "data/legal/<slug>.md",
  network: "data/network.json",
  site: "data/site.json",
  sections: "data/sections.json",
  pricing: "data/pricing.json",
  order: "data/order.json",
  css: "data/site.css",
};

/**
 * What the generator writes into `generated.ts`: the declared mode and the
 * kinds whose files were present and valid at build time.
 */
export interface SiteDataBundle {
  mode: SiteDataMode;
  files: Partial<SiteDataKinds>;
}

/** The bundle a shell that never ran the generator carries: backend mode, no files. */
export const EMPTY_SITE_DATA: SiteDataBundle = { mode: "backend", files: {} };

/** The sentence a `local` shell fails with when a kind it is asked for has no file. */
export function missingSiteDataMessage(kind: SiteDataKind): string {
  return (
    `[site-data] data mode is "local" but ${SITE_DATA_FILES[kind]} is missing: ` +
    `a local shell serves "${kind}" from its data/ folder only, so add the file ` +
    `(or declare "data": "hybrid" in composer.json to fall back to the backend).`
  );
}

/**
 * The rule. `backend`: undefined, always - no file is read, whatever data/
 * holds. `hybrid`: the file when it was bundled, else undefined, and the
 * caller falls back to the backend. `local`: the file, or an Error naming
 * the missing file - a local shell has nothing to fall back to.
 */
export function resolveSiteData<K extends SiteDataKind>(
  bundle: SiteDataBundle,
  kind: K,
): SiteDataKinds[K] | undefined {
  if (bundle.mode === "backend") return undefined;
  const value = bundle.files[kind];
  if (value !== undefined) return value;
  if (bundle.mode === "local") throw new Error(missingSiteDataMessage(kind));
  return undefined;
}

/**
 * Whether `resolveSiteData` would answer a value: false in `backend` mode
 * and for a kind with no file, never a throw - so a renderer in `hybrid`
 * mode can choose between data/ and its backend without a try/catch.
 */
export function hasSiteDataIn(bundle: SiteDataBundle, kind: SiteDataKind): boolean {
  return bundle.mode !== "backend" && bundle.files[kind] !== undefined;
}
