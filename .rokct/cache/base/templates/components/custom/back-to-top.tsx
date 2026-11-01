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

// The floating "Back to top" button (since 1.42.0). Ray, 2026-09-11
// 12:32Z: "whats missing is floating push to home, that button you press
// and it get you to top i just forgot what it says". The standard control:
// hidden at the top of the page, shown once the visitor has scrolled past
// the threshold (one viewport height unless `threshold` says otherwise),
// fixed at the bottom right of the viewport, and a click scrolls to the
// top - smoothly, or as an instant jump when the visitor prefers reduced
// motion (components/custom/landing/back-to-top.ts holds these rules).
//
// Every page, every shell (1.56.0; Ray, 2026-10-31: "every app shell need
// the button to go up"). Until then only the landing shell and the site
// frame mounted it, so an admin page, a home SDK's own page (a studio
// home, a course page, the loans area) had none. Now base's theme seam -
// components/custom/theme-provider.tsx, which every shell's root layout
// already wraps its page in - mounts one with `scope="root"` on every
// route with no host edit. A FRAMED button (the default scope: the
// landing shell, the site frame, a home SDK's own page root) sits inside
// a site's own look and wears it; while one is mounted the root button
// draws nothing, so a page never shows two.
//
// The button is ALWAYS in the tree, so the server and the first client
// render agree (hidden), and it fades rather than pops; while hidden it is
// out of the tab order (tabIndex -1), out of the accessibility tree
// (aria-hidden) and takes no pointer events. The scroll listener is
// passive and folded into one requestAnimationFrame per frame, and every
// window read happens in the effect or the click, never at render.
//
// Stacking: z-30, under the header (sticky, z-50) and under its mobile
// panel (fixed, z-40), so an open menu covers the button rather than the
// other way round. Bottom right, clear of the device's safe-area insets
// (bottom and right), leaves the left edge and the vertical middle to a
// home SDK's own floating nav. Any element fixed in the same corner (a
// chat or WhatsApp bubble, a cookie button) declares itself with
// `data-rokct-floating` and the button rises above it; a site can also
// lift it with `--back-to-top-offset`.
//
// The look is the site's own: every colour is a CSS variable with a
// shadcn token behind it - `--back-to-top-bg` (else --background),
// `--back-to-top-fg` (else --primary), `--back-to-top-border` (else
// --border), `--back-to-top-hover-bg` / `--back-to-top-hover-fg` (else
// --primary / --primary-foreground) and `--back-to-top-ring` (else
// --ring) - so a site that sets its tokens on its own root (a local-data
// site's .cs-site, a home SDK's landing class) dresses the framed button
// with no code here, and a page whose look lives in other variables
// names them on these. No colour is named here. The arrow is Remixicon's
// ri-arrow-up-line, drawn inline.
//
// Per site (1.56.0; Ray, 2026-10-31: the button must not look the same on
// every site): the look, the place and the switch come from a
// BackToTopConfig (./landing/back-to-top.ts) - enabled, position
// (bottom-right, bottom-left, bottom-center), icon (arrow-up,
// arrow-up-circle, chevron-up, rocket; Remixicon paths inline), shape
// (circle, rounded-square, pill-with-label, text-arrow), label, the
// colours, offset, showAfter and the design language (radius, size, the
// label's type, border, shadow, motion). The theme seam resolves it once
// per site and hands it down through <BackToTopProvider>; every button,
// root or framed, reads the same one, and `enabled: false` draws none.
// What the config leaves unset falls back to the site's tokens through
// the `--back-to-top-*` variables: `--radius` for a rounded square, the
// inherited font, shadcn's colours. The glyph keeps at least 3:1 against
// its fill: the button measures its own colours after paint and, when the
// derived pair falls short (a light primary on a light ground), switches
// to the primary as the fill, else to black or white ink
// (contrastTone). The text-arrow has no fill to measure against, so its
// words carry a soft halo of the page's background instead.

import React, { type CSSProperties, type MouseEvent } from "react";

import {
  BACK_TO_TOP_ICON_PATHS,
  BACK_TO_TOP_LABEL,
  DEFAULT_BACK_TO_TOP,
  FLOATING_SELECTOR,
  REDUCED_MOTION_MEDIA_QUERY,
  TEXT_ARROW_HEAD_PATH,
  backToTopVariables,
  bottomFor,
  contrastTone,
  defaultRadius,
  floatingLift,
  horizontalFor,
  inkFor,
  isPastThreshold,
  parseColour,
  resolveBackToTop,
  resolveThreshold,
  scrollBehaviour,
  visibleLabel,
  yieldsToFrame,
  type BackToTopConfig,
  type BackToTopScope,
  type BackToTopTone,
  type ResolvedBackToTop,
  type Rgba,
} from "@/components/custom/landing/back-to-top";

export {
  BACK_TO_TOP_LABEL,
  BACK_TO_TOP_BOTTOM,
  BACK_TO_TOP_RIGHT,
  FLOATING_ATTRIBUTE,
  FLOATING_SELECTOR,
  REDUCED_MOTION_MEDIA_QUERY,
  bottomFor,
  floatingLift,
  isPastThreshold,
  resolveBackToTop,
  resolveThreshold,
  scrollBehaviour,
  yieldsToFrame,
} from "@/components/custom/landing/back-to-top";
export type {
  BackToTopConfig,
  BackToTopScope,
  FloatingBox,
  ResolvedBackToTop,
} from "@/components/custom/landing/back-to-top";

/** What the theme seam hands every button: the site's resolved config and its name. */
export interface BackToTopContextValue {
  config: ResolvedBackToTop;
  siteName: string;
}

const BackToTopContext = React.createContext<BackToTopContextValue>({
  config: DEFAULT_BACK_TO_TOP,
  siteName: "",
});

/** Hands the site's config to every button below it (mounted once by the theme seam). */
export function BackToTopProvider({ value, children }: { value: BackToTopContextValue; children?: React.ReactNode }) {
  return <BackToTopContext.Provider value={value}>{children}</BackToTopContext.Provider>;
}

export interface BackToTopProps {
  /**
   * Pixels scrolled before the button shows. Absent, the config's
   * showAfter, else one viewport height (half the scrollable distance on a
   * short page), read on every check so a resized window keeps the rule.
   */
  threshold?: number;
  /** The accessible name and title; "Back to top" by default. */
  label?: string;
  /** Extra classes on the button. */
  className?: string;
  /**
   * "frame" (the default) inside a site's own look; "root" only for the
   * one base's theme seam mounts on every page, which yields to a frame.
   */
  scope?: BackToTopScope;
  /** Fields laid over the site's config for this one button (rarely needed). */
  config?: BackToTopConfig;
}

/** The classes every shape shares: the place in the stack, the focus ring and the fade. */
export const BACK_TO_TOP_CLASS =
  "group fixed z-30 flex items-center justify-center " +
  "[--back-to-top-gap:1rem] md:[--back-to-top-gap:1.5rem] " +
  "focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-[color:var(--back-to-top-ring,hsl(var(--ring)))] " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "motion-safe:transition-[opacity,transform,background-color,color,box-shadow] " +
  "motion-safe:[transition-duration:var(--back-to-top-duration,200ms)] " +
  "motion-safe:[transition-timing-function:var(--back-to-top-easing,cubic-bezier(0.4,0,0.2,1))]";

/** The filled shapes (circle, rounded square, pill): the site's colour variables over its tokens. */
export const BACK_TO_TOP_FILLED_CLASS =
  "min-h-11 min-w-11 h-[var(--back-to-top-size,2.75rem)] " +
  "[border-width:var(--back-to-top-border-width,1px)] [border-style:var(--back-to-top-border-style,solid)] " +
  "[box-shadow:var(--back-to-top-shadow,0_4px_6px_-1px_rgb(0_0_0_/_0.1),0_2px_4px_-2px_rgb(0_0_0_/_0.1))] " +
  "border-[color:var(--back-to-top-border,hsl(var(--border)))] " +
  "bg-[color:var(--back-to-top-bg,hsl(var(--background)))] " +
  "text-[color:var(--back-to-top-fg,hsl(var(--primary)))] " +
  "hover:bg-[color:var(--back-to-top-hover-bg,hsl(var(--primary)))] " +
  "hover:text-[color:var(--back-to-top-hover-fg,hsl(var(--primary-foreground)))]";

/** The text-arrow: nothing behind the words, the primary as ink, a soft halo for legibility. */
export const BACK_TO_TOP_TEXT_ARROW_CLASS =
  "min-h-11 min-w-11 flex-col gap-1 bg-transparent border-0 px-2 py-2 shadow-none " +
  "text-[color:var(--back-to-top-fg,hsl(var(--primary)))] " +
  "hover:text-[color:var(--back-to-top-hover-fg,var(--back-to-top-fg,hsl(var(--primary))))] " +
  "[text-shadow:0_0_6px_var(--back-to-top-halo,hsl(var(--background)/0.85)),0_0_2px_var(--back-to-top-halo,hsl(var(--background)/0.85))]";

/** The label's type, from the config's design language or the site's inherited face. */
const LABEL_STYLE: CSSProperties = {
  fontFamily: "var(--back-to-top-font, inherit)",
  fontWeight: "var(--back-to-top-font-weight, 600)" as CSSProperties["fontWeight"],
  textTransform: "var(--back-to-top-text-transform, none)" as CSSProperties["textTransform"],
  letterSpacing: "var(--back-to-top-letter-spacing, normal)",
  fontSize: "var(--back-to-top-font-size, 0.8125rem)",
  lineHeight: 1,
};

// How many framed buttons are mounted, shared by every instance in the
// bundle, so the root button can step aside while a frame serves the page.
let framesMounted = 0;
const frameListeners = new Set<() => void>();
function subscribeFrames(listener: () => void): () => void {
  frameListeners.add(listener);
  return () => {
    frameListeners.delete(listener);
  };
}
function registerFrame(): () => void {
  framesMounted += 1;
  frameListeners.forEach((listener) => listener());
  return () => {
    framesMounted -= 1;
    frameListeners.forEach((listener) => listener());
  };
}
const framesNow = () => framesMounted;
const framesOnServer = () => 0;

/**
 * Any CSS colour the browser resolves (rgb, hsl, oklch, a variable) as an
 * Rgba, through a 1x1 canvas, which normalises every syntax; null when it
 * cannot be read.
 */
function colourOf(css: string, ctx: CanvasRenderingContext2D | null): Rgba | null {
  const direct = parseColour(css);
  if (direct || !ctx) return direct;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = "rgba(0, 0, 0, 0)";
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a / 255];
}

/** The computed colour a probe element takes for `value` inside the button's scope. */
function probeColour(host: HTMLElement, value: string, ctx: CanvasRenderingContext2D | null): Rgba | null {
  const probe = document.createElement("span");
  probe.style.color = value;
  probe.style.display = "none";
  host.appendChild(probe);
  const colour = colourOf(getComputedStyle(probe).color, ctx);
  probe.remove();
  return colour;
}

export function BackToTop({
  threshold,
  label = BACK_TO_TOP_LABEL,
  className = "",
  scope = "frame",
  config: own,
}: BackToTopProps) {
  const site = React.useContext(BackToTopContext);
  const ownKey = own ? JSON.stringify(own) : "";
  const config = React.useMemo(
    () => (ownKey ? resolveBackToTop(site.config, JSON.parse(ownKey) as BackToTopConfig) : site.config),
    [site.config, ownKey],
  );
  const showAfter = threshold ?? config.showAfter;
  // Hidden until the effect measures the page: the server and the first
  // client render agree.
  const [visible, setVisible] = React.useState(false);
  const [lift, setLift] = React.useState(0);
  const [tone, setTone] = React.useState<{ tone: BackToTopTone; vars: Record<string, string> }>({ tone: "as-is", vars: {} });
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const frames = React.useSyncExternalStore(subscribeFrames, framesNow, framesOnServer);
  const yielded = yieldsToFrame(scope, frames);
  const drawn = config.enabled && !yielded;

  React.useEffect(() => (scope === "frame" ? registerFrame() : undefined), [scope]);

  React.useEffect(() => {
    if (!drawn) return undefined;
    let frame = 0;
    const check = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(isPastThreshold(window.scrollY, resolveThreshold(showAfter, window.innerHeight, scrollable)));
      const boxes = Array.from(document.querySelectorAll(FLOATING_SELECTOR), (el) => el.getBoundingClientRect());
      setLift(floatingLift(boxes, window.innerWidth, window.innerHeight, config.position));
    };
    // One measurement per animation frame however many scroll events
    // arrive in it; passive, so the listener never delays the scroll.
    const onScroll = () => {
      if (frame !== 0) return;
      frame = window.requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [showAfter, drawn, config.position]);

  // The glyph's contrast against its fill, measured from the painted
  // colours and again whenever the theme flips (the class or style on
  // <html>). The text-arrow has no fill: its halo carries it instead.
  React.useEffect(() => {
    const button = buttonRef.current;
    // Measured in the button's parent: the site's own variables apply
    // there, the tone this effect writes onto the button does not.
    const scopeEl = button?.parentElement;
    if (!drawn || !button || !scopeEl || config.shape === "text-arrow") return undefined;
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      ctx = canvas.getContext("2d", { willReadFrequently: true });
    } catch {
      ctx = null;
    }
    const measure = () => {
      const restVars = backToTopVariables(config);
      const fg = probeColour(scopeEl, restVars["--back-to-top-fg"] ?? "var(--back-to-top-fg, hsl(var(--primary)))", ctx);
      const bg = probeColour(scopeEl, restVars["--back-to-top-bg"] ?? "var(--back-to-top-bg, hsl(var(--background)))", ctx);
      const page = probeColour(scopeEl, "hsl(var(--background))", ctx) ?? undefined;
      if (!fg || !bg) return;
      const primary = probeColour(scopeEl, "hsl(var(--primary))", ctx);
      const primaryFg = probeColour(scopeEl, "hsl(var(--primary-foreground))", ctx);
      const solid = primary && primaryFg ? { fg: primaryFg, bg: primary } : null;
      const next = contrastTone({ fg, bg }, solid, page);
      if (next === "solid") {
        setTone({
          tone: next,
          vars: {
            "--back-to-top-bg": "hsl(var(--primary))",
            "--back-to-top-fg": "hsl(var(--primary-foreground))",
            "--back-to-top-border": "hsl(var(--primary))",
            "--back-to-top-hover-bg": "hsl(var(--primary-foreground))",
            "--back-to-top-hover-fg": "hsl(var(--primary))",
          },
        });
      } else if (next === "ink") {
        setTone({ tone: next, vars: { "--back-to-top-fg": inkFor(bg, page) } });
      } else {
        setTone({ tone: next, vars: {} });
      }
    };
    measure();
    if (typeof MutationObserver === "undefined") return undefined;
    const observer = new MutationObserver(() => window.requestAnimationFrame(measure));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    return () => observer.disconnect();
  }, [drawn, config]);

  if (!drawn) return null;

  const scrollToTop = (event: MouseEvent<HTMLButtonElement>) => {
    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia(REDUCED_MOTION_MEDIA_QUERY).matches;
    window.scrollTo({ top: 0, behavior: scrollBehaviour(reducedMotion) });
    // The button hides at the top; focus must not stay on a hidden control.
    event.currentTarget.blur();
  };

  const words = visibleLabel(config, site.siteName);
  const textArrow = config.shape === "text-arrow";
  const centred = config.position === "bottom-center";
  const shapeClass = textArrow
    ? BACK_TO_TOP_TEXT_ARROW_CLASS
    : `${BACK_TO_TOP_FILLED_CLASS} ${config.shape === "pill-with-label" ? "gap-2 px-4" : "w-[var(--back-to-top-size,2.75rem)]"}`;
  const style = {
    ...backToTopVariables(config),
    ...tone.vars,
    ...horizontalFor(config.position),
    bottom: bottomFor(lift),
    borderRadius: textArrow ? undefined : `var(--back-to-top-radius, ${defaultRadius(config.shape)})`,
  } as CSSProperties;

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={scrollToTop}
      aria-label={label}
      title={label}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      data-back-to-top={visible ? "shown" : "hidden"}
      data-back-to-top-scope={scope}
      data-back-to-top-shape={config.shape}
      data-back-to-top-position={config.position}
      data-back-to-top-tone={tone.tone}
      className={`${BACK_TO_TOP_CLASS} ${shapeClass} ${centred ? "-translate-x-1/2" : ""} ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"} ${className}`}
      style={style}
    >
      {textArrow ? (
        <>
          <svg
            viewBox="6 8 12 6"
            width="22"
            height="11"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
            className="motion-safe:transition-transform motion-safe:[transition-duration:var(--back-to-top-duration,200ms)] group-hover:-translate-y-0.5"
            style={{ filter: "drop-shadow(0 0 3px var(--back-to-top-halo, hsl(var(--background) / 0.85)))" }}
          >
            <path d={TEXT_ARROW_HEAD_PATH} />
          </svg>
          <span aria-hidden="true" style={{ ...LABEL_STYLE, writingMode: "vertical-rl", transform: "rotate(180deg)", whiteSpace: "nowrap" }}>
            {words}
          </span>
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false">
            <path d={BACK_TO_TOP_ICON_PATHS[config.icon]} />
          </svg>
          {words ? (
            <span aria-hidden="true" style={LABEL_STYLE}>
              {words}
            </span>
          ) : null}
        </>
      )}
    </button>
  );
}

export default BackToTop;
