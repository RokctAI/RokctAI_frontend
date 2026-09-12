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
// The button is ALWAYS in the tree, so the server and the first client
// render agree (hidden), and it fades rather than pops; while hidden it is
// out of the tab order (tabIndex -1), out of the accessibility tree
// (aria-hidden) and takes no pointer events. The scroll listener is
// passive and folded into one requestAnimationFrame per frame, and every
// window read happens in the effect or the click, never at render.
//
// Stacking: z-30, under the header (sticky, z-50) and under its mobile
// panel (fixed, z-40), so an open menu covers the button rather than the
// other way round; the install offer is inline in the footer's Downloads
// nav, never fixed, so the two never meet. Bottom right leaves the left
// edge and the vertical middle to a home SDK's own floating nav. Theme
// tokens only: `bg-background`, `border-border`, `text-primary`,
// `hover:bg-muted`, `ring-ring`; no colour is named here.
//
// components/custom/landing-content.tsx mounts it once, after <main>, so
// every composed landing has it with no host edit; a host that wants it on
// every page mounts `<BackToTop />` in its own root layout instead.

import React from "react";
import { ArrowUp } from "lucide-react";

import {
  BACK_TO_TOP_LABEL,
  REDUCED_MOTION_MEDIA_QUERY,
  isPastThreshold,
  resolveThreshold,
  scrollBehaviour,
} from "@/components/custom/landing/back-to-top";

export {
  BACK_TO_TOP_LABEL,
  REDUCED_MOTION_MEDIA_QUERY,
  isPastThreshold,
  resolveThreshold,
  scrollBehaviour,
} from "@/components/custom/landing/back-to-top";

export interface BackToTopProps {
  /**
   * Pixels scrolled before the button shows. Absent, one viewport height,
   * read on every check so a resized window keeps the rule.
   */
  threshold?: number;
  /** The accessible name and title; "Back to top" by default. */
  label?: string;
  /** Extra classes on the button. */
  className?: string;
}

/** The button's own classes: position, shape, the theme tokens and the fade. */
export const BACK_TO_TOP_CLASS =
  "fixed bottom-4 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full " +
  "border border-border bg-background text-primary shadow-md hover:bg-muted " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "motion-safe:transition-opacity motion-safe:duration-200 md:bottom-6 md:right-6";

export function BackToTop({
  threshold,
  label = BACK_TO_TOP_LABEL,
  className = "",
}: BackToTopProps) {
  // Hidden until the effect measures the page: the server and the first
  // client render agree.
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      setVisible(isPastThreshold(window.scrollY, resolveThreshold(threshold, window.innerHeight)));
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
  }, [threshold]);

  const scrollToTop = (event: React.MouseEvent<HTMLButtonElement>) => {
    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia(REDUCED_MOTION_MEDIA_QUERY).matches;
    window.scrollTo({ top: 0, behavior: scrollBehaviour(reducedMotion) });
    // The button hides at the top; focus must not stay on a hidden control.
    event.currentTarget.blur();
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={label}
      title={label}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      data-back-to-top={visible ? "shown" : "hidden"}
      className={`${BACK_TO_TOP_CLASS} ${visible ? "opacity-100" : "pointer-events-none opacity-0"} ${className}`}
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}

export default BackToTop;
