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

// The generic landing hero (since 1.32.0 a SERVER component; Ray,
// 2026-09-10: "hero i think should be server side if not the whole
// landing"). It carries no product feature of its own: the copy is
// ./landing/hero-config.ts overlaid by whatever the home SDK registered in
// ./landing/hero-copy.ts, and until 1.31.0 the hero resolved that overlay
// in a client effect after mount, showing NO words while it loaded so a
// visitor never saw another product's copy first - which meant the first
// HTML carried an empty headline. Now the overlay is awaited here, on the
// server (landing-page.ts: resolveHeroConfig), and the resolved copy goes
// to the client view (./hero-view.tsx) as props, so the first HTML carries
// the right words and nothing is loaded after mount. The view keeps what
// only the client can do: the word rotation, the visitor's branding cache
// and the registered form (./landing/hero-form.ts, next/dynamic, still
// server-rendered with the rest).
//
// `fallbackHref`, HeroConfig's one function-typed field, cannot cross the
// server-to-client boundary as a prop; the view resolves it beside the
// form that consumes it (see hero-view.tsx), so a registered copy's
// override still reaches the form. Every other field is data and is
// handed over as it is.
//
// The 1.32.0 `brand` field of the copy ("name", the default, or "stem")
// is resolved here too (landing-page.ts: resolveHeroWordmark): "stem"
// hands the view the platform name's stem as the wordmark's text, with the
// full name for its aria-label and title; "name" hands nothing and the
// view draws the host's own Branding component, exactly as before.

import React from "react";

import { PLATFORM_NAME } from "@/app/config/platform";
import { HeroView, type HeroViewCopy } from "@/components/custom/hero-view";
import {
  resolveHeroConfig,
  resolveHeroWordmark,
} from "@/components/custom/landing/landing-page";

export { hasBadgeIcon } from "@/components/custom/hero-view";

export interface HeroProps {
  signupUrl?: string;
  id?: string;
}

export async function Hero({ signupUrl = "/register", id }: HeroProps) {
  const { fallbackHref: _fallbackHref, ...copy } = await resolveHeroConfig();
  const hero: HeroViewCopy = copy;
  return (
    <HeroView
      hero={hero}
      wordmark={resolveHeroWordmark(hero.brand, PLATFORM_NAME)}
      signupUrl={signupUrl}
      id={id}
    />
  );
}
