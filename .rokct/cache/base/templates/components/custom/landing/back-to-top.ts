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

/** The button's accessible name and title. */
export const BACK_TO_TOP_LABEL = "Back to top";

/** The media query under which the jump is instant instead of smooth. */
export const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * The scroll distance, in pixels, past which the button shows: the
 * configured threshold when it is a finite, non-negative number, else one
 * viewport height (the default: the button appears once the first screen
 * has scrolled away). A viewport height that is not a positive number - a
 * window not yet measured - answers 0, so any scroll shows the button
 * rather than none.
 */
export function resolveThreshold(threshold: number | undefined, viewportHeight: number): number {
  if (typeof threshold === "number" && Number.isFinite(threshold) && threshold >= 0) {
    return threshold;
  }
  return Number.isFinite(viewportHeight) && viewportHeight > 0 ? viewportHeight : 0;
}

/**
 * Whether the page has scrolled PAST the threshold: strictly greater, so
 * the button is hidden at the very top whatever the threshold, and a
 * scroll offset that is not a number (never measured) hides it.
 */
export function isPastThreshold(scrollY: number, threshold: number): boolean {
  return Number.isFinite(scrollY) && scrollY > threshold;
}

/**
 * How the jump scrolls: "smooth" by default, "auto" - the instant jump -
 * when the visitor prefers reduced motion.
 */
export function scrollBehaviour(reducedMotion: boolean): ScrollBehavior {
  return reducedMotion ? "auto" : "smooth";
}
