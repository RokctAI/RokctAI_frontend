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

// The Sticks landing's two faces, as the concept sets them: Montserrat for
// the display type and Nunito for running text. Both are SIL OFL fonts
// served through next/font/google, so the shell self-hosts them at build
// time and the page loads nothing from Google at run time. They arrive in
// sticks-landing.css as --font-stx-display and --font-stx-body.

import { Montserrat, Nunito } from "next/font/google";

export const sticksDisplay = Montserrat({
  subsets: ["latin"],
  variable: "--font-stx-display",
  display: "swap",
});

export const sticksBody = Nunito({
  subsets: ["latin"],
  variable: "--font-stx-body",
  display: "swap",
});

export const sticksFontClassName = [sticksDisplay.variable, sticksBody.variable].join(" ");
