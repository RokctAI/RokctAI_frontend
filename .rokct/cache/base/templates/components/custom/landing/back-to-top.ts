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

// The floating "Back to top" button's rules (since 1.42.0). Ray,
// 2026-09-11 12:32Z: "whats missing is floating push to home, that button
// you press and it get you to top i just forgot what it says". This is the
// pure half - the threshold, the shown-or-hidden answer, the words and the
// scroll behaviour - beside the client component
// components/custom/back-to-top.tsx, so the rules run under node's own
// test runner (tests/back-to-top.test.mts) with no DOM. Nothing here reads
// `window`; the component hands the numbers in.
//
// Since 1.56.0 (Ray, 2026-10-31: "every app shell need the button to go
// up") two more rules live here: which of two mounted buttons draws (the
// root one base's theme seam mounts on every page yields to a framed one
// that sits inside a site's own look), and how high the button sits (above
// any element that declares itself floating in the same bottom-right
// corner, such as a chat or WhatsApp bubble, and clear of the device's
// safe-area insets). And, per site (Ray, 2026-10-31: the button must not
// look the same on every site), the BackToTopConfig, its layering
// (resolveBackToTop), the variables it writes, the placement, the shapes'
// words, the Remixicon paths and the contrast guarantee (contrastTone).

/** The button's accessible name and title. */
export const BACK_TO_TOP_LABEL = "Back to top";

/** The media query under which the jump is instant instead of smooth. */
export const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * The scroll distance, in pixels, past which the button shows: the
 * configured threshold (a site's `showAfter`) when it is a finite,
 * non-negative number, else one viewport height - the button appears once
 * the first screen has scrolled away. Since 1.56.0 the default is capped
 * at half the page's scrollable distance when that is known
 * (`scrollable`, the document height less the viewport), so a short page
 * such as a sign-in form still gets the button once its visitor has
 * scrolled half of it, instead of never. A viewport height that is not a
 * positive number - a window not yet measured - answers 0, so any scroll
 * shows the button rather than none.
 */
export function resolveThreshold(
  threshold: number | undefined,
  viewportHeight: number,
  scrollable?: number,
): number {
  if (typeof threshold === "number" && Number.isFinite(threshold) && threshold >= 0) {
    return threshold;
  }
  const screen = Number.isFinite(viewportHeight) && viewportHeight > 0 ? viewportHeight : 0;
  if (typeof scrollable === "number" && Number.isFinite(scrollable) && scrollable > 0 && screen > 0) {
    return Math.min(screen, Math.round(scrollable * SHORT_PAGE_SHARE));
  }
  return screen;
}

/** The share of a short page's scrollable distance after which the button shows (1.56.0). */
export const SHORT_PAGE_SHARE = 0.5;

/**
 * Whether the page has scrolled PAST the threshold: strictly greater, so
 * the button is hidden at the very top whatever the threshold, and a
 * scroll offset that is not a number (never measured) hides it.
 */
export function isPastThreshold(scrollY: number, threshold: number): boolean {
  return Number.isFinite(scrollY) && scrollY > threshold;
}

/**
 * How the jump scrolls: "smooth" by default, "instant" when the visitor
 * prefers reduced motion. Since 1.56.0 "instant", not "auto": "auto"
 * follows the page's CSS `scroll-behavior`, and a site whose stylesheet
 * sets `html { scroll-behavior: smooth }` (the studio home does) would
 * glide even under reduced motion.
 */
export function scrollBehaviour(reducedMotion: boolean): ScrollBehavior {
  return reducedMotion ? "instant" : "smooth";
}

/**
 * Where a mounted button sits (1.56.0). "frame" is a button inside a
 * site's own look - the landing shell, the site frame, a home SDK's own
 * page root - so it wears the CSS variables that look declares. "root" is
 * the one base's theme seam (components/custom/theme-provider.tsx) mounts
 * on every page of every shell, the fallback for a page with no frame.
 */
export type BackToTopScope = "frame" | "root";

/**
 * Whether a button draws nothing because another one already serves the
 * page: the root button yields while at least one framed button is
 * mounted, so a page never shows two; a framed button never yields.
 */
export function yieldsToFrame(scope: BackToTopScope, framesMounted: number): boolean {
  return scope === "root" && Number.isFinite(framesMounted) && framesMounted > 0;
}

/**
 * The attribute a floating element carries so the button stacks above it
 * (1.56.0): any element fixed in the bottom-right corner - a chat or
 * WhatsApp bubble, a cookie button - sets `data-rokct-floating` and the
 * button moves up to clear it instead of covering it.
 */
export const FLOATING_ATTRIBUTE = "data-rokct-floating";

/** The selector the component measures: every element carrying FLOATING_ATTRIBUTE. */
export const FLOATING_SELECTOR = `[${FLOATING_ATTRIBUTE}]`;

/** The space, in pixels, between the button and the floating element it clears. */
export const FLOATING_GAP = 12;

/**
 * How close, in pixels, an element's right and bottom edges must come to
 * the viewport's for it to share the button's corner.
 */
export const CORNER_REACH = 120;

/** An element's box as getBoundingClientRect() reports it, in viewport pixels. */
export interface FloatingBox {
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  /** Its left edge; needed only for a button on the left or in the centre. */
  left?: number;
}

/**
 * Whether a box shares the button's corner (or, for a centred button, the
 * bottom middle): its bottom within CORNER_REACH of the viewport's, and
 * its right edge (bottom-right), its left edge (bottom-left) or its span
 * (bottom-center, the middle CORNER_REACH * 2 pixels) near the button.
 */
function sharesPlace(box: FloatingBox, position: BackToTopPosition, width: number, height: number): boolean {
  if (box.bottom < height - CORNER_REACH) return false;
  const left = typeof box.left === "number" && Number.isFinite(box.left) ? box.left : box.right - box.width;
  if (position === "bottom-left") return left <= CORNER_REACH;
  if (position === "bottom-center") return left <= width / 2 + CORNER_REACH && box.right >= width / 2 - CORNER_REACH;
  return box.right >= width - CORNER_REACH;
}

/**
 * How far above the viewport's bottom edge, in whole pixels, the button
 * must sit to clear every floating element in its place: the highest such
 * element's top plus FLOATING_GAP, measured up from the bottom. The place
 * is the button's position (bottom-right unless the site moved it, 1.56.0).
 * An element with no size (hidden), one away from the button's place, and
 * a viewport not yet measured are ignored; nothing to clear answers 0, and
 * the button keeps its own resting place.
 */
export function floatingLift(
  boxes: readonly FloatingBox[],
  viewportWidth: number,
  viewportHeight: number,
  position: BackToTopPosition = "bottom-right",
): number {
  if (!(viewportWidth > 0) || !(viewportHeight > 0)) return 0;
  let lift = 0;
  for (const box of boxes) {
    if (!(box.width > 0) || !(box.height > 0)) continue;
    if (!sharesPlace(box, position, viewportWidth, viewportHeight)) continue;
    lift = Math.max(lift, Math.ceil(viewportHeight - box.top + FLOATING_GAP));
  }
  return lift;
}

/**
 * The button's resting distance from the bottom edge as a CSS length: the
 * gap (`--back-to-top-gap`, 1rem, 1.5rem from md up), the device's bottom
 * safe-area inset and a site's own `--back-to-top-offset` (0 unless the
 * site sets it).
 */
export const BACK_TO_TOP_BOTTOM =
  "calc(var(--back-to-top-gap, 1rem) + env(safe-area-inset-bottom, 0px) + var(--back-to-top-offset, 0px))";

/** The button's distance from the right edge: the gap and the right safe-area inset. */
export const BACK_TO_TOP_RIGHT = "calc(var(--back-to-top-gap, 1rem) + env(safe-area-inset-right, 0px))";

/** The button's distance from the left edge (position bottom-left, 1.56.0). */
export const BACK_TO_TOP_LEFT = "calc(var(--back-to-top-gap, 1rem) + env(safe-area-inset-left, 0px))";

/**
 * The bottom the button takes: its resting place, or - when a floating
 * element shares the corner - high enough to clear it (floatingLift), and
 * never lower than the resting place.
 */
export function bottomFor(lift: number): string {
  return Number.isFinite(lift) && lift > 0 ? `max(${BACK_TO_TOP_BOTTOM}, ${lift}px)` : BACK_TO_TOP_BOTTOM;
}

// --------------------------------------------------------------------------
// Per-site configuration (1.56.0). Ray, 2026-10-31: the button is
// customisable per site - colour, position, icon, on/off - and must NOT
// look the same on every site: base supplies the mechanism and a neutral
// fallback, each home SDK registers its own default style (see
// ./back-to-top-style.ts) and a shell with a data/ folder overrides it in
// data/theme.json `backToTop`. Every field is optional; what no layer sets
// is derived from the site's own theme tokens through the CSS variables
// below, so the default looks native without naming a colour here.
// --------------------------------------------------------------------------

/** Where the button sits. */
export type BackToTopPosition = "bottom-right" | "bottom-left" | "bottom-center";
export const BACK_TO_TOP_POSITIONS: readonly BackToTopPosition[] = ["bottom-right", "bottom-left", "bottom-center"];

/** The glyph it draws: Remixicon shapes, inline SVG only. */
export type BackToTopIcon = "arrow-up" | "arrow-up-circle" | "chevron-up" | "rocket";
export const BACK_TO_TOP_ICONS: readonly BackToTopIcon[] = ["arrow-up", "arrow-up-circle", "chevron-up", "rocket"];

/**
 * Its shape: a circle, a rounded square (the site's `--radius`), a pill
 * with a short label beside the icon, or `text-arrow` - an upward arrow
 * whose long shaft IS the site's words (its name unless `label` says
 * otherwise), set vertically under an arrowhead, with nothing behind it.
 */
export type BackToTopShape = "circle" | "rounded-square" | "pill-with-label" | "text-arrow";
export const BACK_TO_TOP_SHAPES: readonly BackToTopShape[] = ["circle", "rounded-square", "pill-with-label", "text-arrow"];

/**
 * One layer of the button's configuration: base's neutral fallback, a home
 * SDK's registered style, a site's data/theme.json `backToTop`. Every field
 * is optional; a later layer wins each field it sets.
 *
 * The colours and the design language are CSS values - a colour, a length,
 * a font stack, a box-shadow, an easing - written onto the button as its
 * `--back-to-top-*` variables, so a value may name the site's own tokens
 * (`"hsl(var(--primary))"`, `"var(--radius)"`, `"var(--font-display)"`).
 */
export interface BackToTopConfig {
  /** false draws no button anywhere on the site. Default true. */
  enabled?: boolean;
  position?: BackToTopPosition;
  icon?: BackToTopIcon;
  shape?: BackToTopShape;
  /**
   * The visible words: the pill's label ("Top" by default) or the
   * text-arrow's shaft (the site's name by default). The accessible name
   * is always "Back to top".
   */
  label?: string;
  /** Colours (default: the site's --background, --primary, --border, --primary-foreground, --ring). */
  background?: string;
  foreground?: string;
  hoverBackground?: string;
  hoverForeground?: string;
  border?: string;
  ring?: string;
  /** The text-arrow's soft glow behind its words (default the page's --background at 85%). */
  halo?: string;
  /** Extra lift above the resting place, in px. */
  offset?: number;
  /** Scroll distance in px before the button shows (default about one screen). */
  showAfter?: number;
  /** Design language: corner radius (default per shape; rounded-square takes the site's --radius). */
  radius?: string;
  /** The circle's and square's side, and the pill's height (default 2.75rem, the 44px hit area). */
  size?: string;
  /** The label's type: family, weight, case, tracking, size. */
  fontFamily?: string;
  fontWeight?: string | number;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  letterSpacing?: string;
  fontSize?: string;
  /** The outline. */
  borderWidth?: string;
  borderStyle?: "solid" | "dashed" | "dotted" | "double" | "none";
  /** A CSS box-shadow ("none" for a flat button). */
  shadow?: string;
  /** Motion: how long the fade and hover take, and their easing. */
  duration?: string;
  easing?: string;
}

/** The pill's label when the config names none. */
export const BACK_TO_TOP_SHORT_LABEL = "Top";

/** What every layer left unset resolves to: the neutral fallback, a circle with ri-arrow-up-line bottom right. */
export interface ResolvedBackToTop extends BackToTopConfig {
  enabled: boolean;
  position: BackToTopPosition;
  icon: BackToTopIcon;
  shape: BackToTopShape;
}

export const DEFAULT_BACK_TO_TOP: ResolvedBackToTop = {
  enabled: true,
  position: "bottom-right",
  icon: "arrow-up",
  shape: "circle",
};

/** The CSS-valued fields and the button variable each one writes. */
export const BACK_TO_TOP_STYLE_VARIABLES = {
  background: "--back-to-top-bg",
  foreground: "--back-to-top-fg",
  hoverBackground: "--back-to-top-hover-bg",
  hoverForeground: "--back-to-top-hover-fg",
  border: "--back-to-top-border",
  ring: "--back-to-top-ring",
  halo: "--back-to-top-halo",
  radius: "--back-to-top-radius",
  size: "--back-to-top-size",
  fontFamily: "--back-to-top-font",
  fontWeight: "--back-to-top-font-weight",
  textTransform: "--back-to-top-text-transform",
  letterSpacing: "--back-to-top-letter-spacing",
  fontSize: "--back-to-top-font-size",
  borderWidth: "--back-to-top-border-width",
  borderStyle: "--back-to-top-border-style",
  shadow: "--back-to-top-shadow",
  duration: "--back-to-top-duration",
  easing: "--back-to-top-easing",
} as const satisfies Partial<Record<keyof BackToTopConfig, `--back-to-top-${string}`>>;

type StyleField = keyof typeof BACK_TO_TOP_STYLE_VARIABLES;

/** A CSS value fit to write into a custom property: a short string with no declaration or markup breakout. */
export function isSafeCssValue(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 160 && !/[;{}<>\\]|\/\*/.test(value);
}

function finiteNonNegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

/**
 * The layers merged, field by field, over DEFAULT_BACK_TO_TOP: a later
 * layer wins every field it sets with a valid value; an absent layer, an
 * unknown enum value, a non-finite number or an unsafe CSS value is
 * skipped, so one bad field never takes the button down.
 */
export function resolveBackToTop(...layers: ReadonlyArray<BackToTopConfig | null | undefined>): ResolvedBackToTop {
  const out: ResolvedBackToTop = { ...DEFAULT_BACK_TO_TOP };
  for (const layer of layers) {
    if (!layer || typeof layer !== "object") continue;
    if (typeof layer.enabled === "boolean") out.enabled = layer.enabled;
    if (BACK_TO_TOP_POSITIONS.includes(layer.position as BackToTopPosition)) out.position = layer.position as BackToTopPosition;
    if (BACK_TO_TOP_ICONS.includes(layer.icon as BackToTopIcon)) out.icon = layer.icon as BackToTopIcon;
    if (BACK_TO_TOP_SHAPES.includes(layer.shape as BackToTopShape)) out.shape = layer.shape as BackToTopShape;
    if (typeof layer.label === "string" && layer.label.trim()) out.label = layer.label.trim();
    if (finiteNonNegative(layer.offset)) out.offset = layer.offset;
    if (finiteNonNegative(layer.showAfter)) out.showAfter = layer.showAfter;
    for (const field of Object.keys(BACK_TO_TOP_STYLE_VARIABLES) as StyleField[]) {
      const value = field === "fontWeight" && typeof layer.fontWeight === "number" ? String(layer.fontWeight) : layer[field];
      if (isSafeCssValue(value)) (out as unknown as Record<string, unknown>)[field] = value.trim();
    }
  }
  return out;
}

/**
 * The inline custom properties the button carries for a resolved config:
 * one `--back-to-top-*` per CSS-valued field that is set, and
 * `--back-to-top-offset` for `offset`. A field left unset writes nothing,
 * so the variable a site's own stylesheet sets (or the token fallback in
 * the button's classes) still applies.
 */
export function backToTopVariables(config: BackToTopConfig): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [field, name] of Object.entries(BACK_TO_TOP_STYLE_VARIABLES) as [StyleField, string][]) {
    const value = config[field];
    if (value !== undefined && value !== null && String(value).trim()) vars[name] = String(value);
  }
  if (finiteNonNegative(config.offset)) vars["--back-to-top-offset"] = `${config.offset}px`;
  return vars;
}

/** The corner radius each shape falls back to when no layer sets one: round, or the site's --radius. */
export function defaultRadius(shape: BackToTopShape): string {
  return shape === "rounded-square" ? "var(--radius, 0.5rem)" : "9999px";
}

/**
 * The words the button shows, if any: the pill's label (else "Top"), the
 * text-arrow's shaft (the label, else the site's name, else "Top"), none
 * for the icon-only shapes.
 */
export function visibleLabel(config: BackToTopConfig, siteName?: string | null): string | null {
  if (config.shape === "pill-with-label") return config.label || BACK_TO_TOP_SHORT_LABEL;
  if (config.shape === "text-arrow") return config.label || (siteName ?? "").trim() || BACK_TO_TOP_SHORT_LABEL;
  return null;
}

/** The horizontal placement for a position: the inset side, or the centre. */
export function horizontalFor(position: BackToTopPosition): { left?: string; right?: string } {
  if (position === "bottom-left") return { left: BACK_TO_TOP_LEFT };
  if (position === "bottom-center") return { left: "50%" };
  return { right: BACK_TO_TOP_RIGHT };
}

/**
 * The icons, as Remixicon's 24x24 paths (inline SVG; never an icon font):
 * ri-arrow-up-line, ri-arrow-up-circle-line, ri-arrow-up-s-line and
 * ri-rocket-line. The text-arrow's head is ri-arrow-up-s-fill.
 */
export const BACK_TO_TOP_ICON_PATHS: Readonly<Record<BackToTopIcon, string>> = {
  "arrow-up": "M13.0001 7.82843V20H11.0001V7.82843L5.63614 13.1924L4.22192 11.7782L12.0001 4L19.7783 11.7782L18.3641 13.1924L13.0001 7.82843Z",
  "arrow-up-circle": "M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2ZM12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20ZM13 12V16H11V12H8L12 8L16 12H13Z",
  "chevron-up": "M11.9999 10.8284L7.0502 15.7782L5.63599 14.364L11.9999 8L18.3639 14.364L16.9497 15.7782L11.9999 10.8284Z",
  rocket: "M4.99958 12.9999C4.99958 7.91198 7.90222 3.5636 11.9996 1.81799C16.0969 3.5636 18.9996 7.91198 18.9996 12.9999C18.9996 13.8229 18.9236 14.6264 18.779 15.4027L20.7194 17.2353C20.8845 17.3913 20.9238 17.6389 20.815 17.8383L18.3196 22.4133C18.1873 22.6557 17.8836 22.7451 17.6412 22.6128C17.5993 22.59 17.5608 22.5612 17.5271 22.5274L15.2925 20.2928C15.1049 20.1053 14.8506 19.9999 14.5854 19.9999H9.41379C9.14857 19.9999 8.89422 20.1053 8.70668 20.2928L6.47209 22.5274C6.27683 22.7227 5.96025 22.7227 5.76498 22.5274C5.73122 22.4937 5.70246 22.4552 5.67959 22.4133L3.18412 17.8383C3.07537 17.6389 3.11464 17.3913 3.27975 17.2353L5.22014 15.4027C5.07551 14.6264 4.99958 13.8229 4.99958 12.9999ZM6.47542 19.6957L7.29247 18.8786C7.85508 18.316 8.61814 17.9999 9.41379 17.9999H14.5854C15.381 17.9999 16.1441 18.316 16.7067 18.8786L17.5237 19.6957L18.5056 17.8955L17.4058 16.8568C16.9117 16.3901 16.6884 15.7045 16.8128 15.0364C16.9366 14.3722 16.9996 13.6911 16.9996 12.9999C16.9996 9.13037 15.0045 5.69965 11.9996 4.04033C8.99462 5.69965 6.99958 9.13037 6.99958 12.9999C6.99958 13.6911 7.06255 14.3722 7.18631 15.0364C7.31078 15.7045 7.08746 16.3901 6.59338 16.8568L5.49353 17.8955L6.47542 19.6957ZM11.9996 12.9999C10.895 12.9999 9.99958 12.1045 9.99958 10.9999C9.99958 9.89537 10.895 8.99994 11.9996 8.99994C13.1041 8.99994 13.9996 9.89537 13.9996 10.9999C13.9996 12.1045 13.1041 12.9999 11.9996 12.9999Z",
};

/** ri-arrow-up-s-fill: the text-arrow's head. */
export const TEXT_ARROW_HEAD_PATH = "M12 8L18 14H6L12 8Z";

// ----------------------------------------------------------------- contrast --

/** The least contrast the glyph keeps against its own fill (WCAG 1.4.11, non-text: 3:1). */
export const MIN_ICON_CONTRAST = 3;

/** An sRGB colour, 0..255 per channel, with alpha 0..1. */
export type Rgba = readonly [number, number, number, number];

/**
 * `rgb()` / `rgba()` (comma or space syntax, as getComputedStyle and a
 * canvas report them) and `#rgb` / `#rrggbb` to an Rgba; null otherwise.
 */
export function parseColour(value: string | null | undefined): Rgba | null {
  if (typeof value !== "string") return null;
  const text = value.trim().toLowerCase();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(text);
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].split("").map((c) => c + c).join("") : hex[1];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1];
  }
  const fn = /^rgba?\(\s*([^)]*)\)$/.exec(text);
  if (!fn) return null;
  const parts = fn[1].split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const channel = (p: string) => (p.endsWith("%") ? (parseFloat(p) * 255) / 100 : parseFloat(p));
  const [r, g, b] = parts.slice(0, 3).map(channel);
  const a = parts[3] === undefined ? 1 : parts[3].endsWith("%") ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
  if (![r, g, b, a].every(Number.isFinite)) return null;
  return [r, g, b, Math.max(0, Math.min(1, a))];
}

/** WCAG relative luminance of an opaque colour, 0..1. */
export function luminance([r, g, b]: Rgba): number {
  const lin = (v: number) => {
    const c = Math.max(0, Math.min(255, v)) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** A colour laid over another (alpha compositing), opaque. */
export function over(top: Rgba, under: Rgba): Rgba {
  const a = top[3];
  return [top[0] * a + under[0] * (1 - a), top[1] * a + under[1] * (1 - a), top[2] * a + under[2] * (1 - a), 1];
}

/** The WCAG contrast ratio of two colours, 1..21. */
export function contrastRatio(a: Rgba, b: Rgba): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * How the button keeps its glyph legible (1.56.0; a yellow arrow on a
 * white circle read at 1.6:1 on the hosting sign-in page):
 * - "as-is": the derived or configured pair already reaches MIN_ICON_CONTRAST;
 * - "solid": swap to the site's primary as the fill with
 *   primary-foreground as the glyph, when that pair reaches it (the usual
 *   answer for a light primary such as a yellow);
 * - "ink": keep the fill and draw the glyph in black or white, whichever
 *   contrasts more with it - the last resort, always at least 3:1 against
 *   an opaque fill.
 * `page` is what shows through a translucent fill (white when unknown).
 */
export type BackToTopTone = "as-is" | "solid" | "ink";

export function contrastTone(
  pair: { fg: Rgba; bg: Rgba },
  solid: { fg: Rgba; bg: Rgba } | null,
  page: Rgba = [255, 255, 255, 1],
): BackToTopTone {
  const bg = over(pair.bg, page);
  if (contrastRatio(over(pair.fg, bg), bg) >= MIN_ICON_CONTRAST) return "as-is";
  if (solid) {
    const sbg = over(solid.bg, page);
    if (contrastRatio(over(solid.fg, sbg), sbg) >= MIN_ICON_CONTRAST) return "solid";
  }
  return "ink";
}

/** The glyph colour for the "ink" tone: black on a light fill, white on a dark one. */
export function inkFor(bg: Rgba, page: Rgba = [255, 255, 255, 1]): "#000000" | "#ffffff" {
  const fill = over(bg, page);
  return contrastRatio([0, 0, 0, 1], fill) >= contrastRatio([255, 255, 255, 1], fill) ? "#000000" : "#ffffff";
}
