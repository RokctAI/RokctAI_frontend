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

// The Sticks site's Back to top button, registered with base_sdk's style
// registry (components/custom/landing/back-to-top-style.ts) so it is the
// button on every route of the shell. Sticks speaks in ink pills - every
// call to action is a fully rounded black button (white in dark) with
// Montserrat 800 - so the button is that pill, labelled "Top". The
// colours name the --stx-* tokens sticks-landing.css sets on <html> while
// the landing is on the page, falling back to base's shadcn tokens.

import type { BackToTopConfig } from "@/components/custom/landing/back-to-top";

export const STICKS_BACK_TO_TOP: BackToTopConfig = {
  shape: "pill-with-label",
  icon: "arrow-up",
  position: "bottom-right",
  label: "Top",
  background: "var(--stx-ink, hsl(var(--primary)))",
  foreground: "var(--stx-paper, hsl(var(--primary-foreground)))",
  hoverBackground: "var(--stx-ink, hsl(var(--primary)))",
  hoverForeground: "var(--stx-paper, hsl(var(--primary-foreground)))",
  border: "transparent",
  ring: "var(--stx-ink, hsl(var(--ring)))",
  radius: "999px",
  size: "2.75rem",
  fontFamily: "var(--font-stx-display, inherit)",
  fontWeight: 800,
  letterSpacing: "-0.01em",
  fontSize: "0.9375rem",
  borderWidth: "0px",
  shadow: "none",
  duration: "150ms",
  easing: "ease",
};

export default STICKS_BACK_TO_TOP;
