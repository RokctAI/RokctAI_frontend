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

// rokct.ai's overlay on base_sdk's hero copy
// (components/custom/landing/hero-copy.ts).
//
// Since 1.24.0 base's hero frame is not drawn on rokct.ai: the redesign
// Ray approved on 2026-11-01 has its own hero (components/custom/
// rokct-hero.tsx) and this SDK's stylesheet keeps base's frame off the page
// (rokct-landing.css, `.rk-landing #hero`). The landing host still renders
// that frame into the HTML, so this copy empties what it would say beyond
// the words: no store badges (the Chrome Web Store badge was the Merlin
// extension's call to action, and rokct.ai has no phone apps in the stores
// yet - "Phone apps" is "Coming soon" on the page) and no trust line.
// 1.15.0 to 1.23.0 named base's store-mark files for those badges here.

import type { HeroCopy } from "@/components/custom/landing/hero-copy";

const AGENT_HERO_COPY: HeroCopy = {
  badges: [],
  trustLine: [],
};

export default AGENT_HERO_COPY;
