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


// A local-data site's hero copy for base_sdk's hero-copy registry. The
// headline is the data hero's stacked poster lines, drawn by the hero form,
// so no rotating words are registered (base's h1 then renders nothing and
// the form carries the page's one h1). The data hero itself travels to the
// form as `formData` (base_sdk >= 1.53.0), with its links already resolved,
// so the client form never imports the data reader.
import type { HeroCopy } from "@/components/custom/landing/hero-copy";

import type { SiteHeroSection, SitePricingSection } from "@/lib/site-data/kinds";

import type { SiteHeroFormData, SiteHeroLoopData } from "./site-hero-form";
import { isExternalHref, resolveHref, siteHero, siteKind, siteSections } from "./site-source";
import { siteSizes } from "./site-sizes";

/**
 * 1.7.0: the hero's sizes scene, when the site has all three sizes in
 * data/products.json, a South River bottle behind the poster hero and a
 * pricing section's `own` block, which gives the scene its words: the
 * eyebrow, the heading (its last sentence one word a line, the last line
 * accented: "Our water." / "Three" / "sizes."), the first line of its text
 * as the lede, and the facts (each size's fact, then the hero's first).
 */
function heroLoopData(hero: SiteHeroSection): SiteHeroLoopData | undefined {
  if ((hero.variant ?? "poster") !== "poster") return undefined;
  const back = hero.art?.back;
  const front = hero.art?.front;
  if (back?.kind !== "bottle" || front?.kind !== "bottle") return undefined;
  const sizes = siteSizes();
  if (![500, 1500, 5000].every((ml) => sizes.some((s) => s.ml === ml))) return undefined;
  const own = siteSections().find((s): s is SitePricingSection => s.type === "pricing" && !!s.own)?.own;
  if (!own) return undefined;
  const sentences = own.heading.split(/(?<=[.!?])\s+/).filter(Boolean);
  const last = sentences.pop() ?? "";
  const lines = [...sentences, ...last.split(/\s+/).filter(Boolean)];
  return {
    eyebrow: own.eyebrow,
    lines,
    accentLine: lines.length - 1,
    lede: own.text?.split("\n")[0],
    facts: [...sizes.map((s) => s.fact), ...(hero.facts ?? []).slice(0, 1)],
    sizes,
  };
}

function heroFormData(): SiteHeroFormData | undefined {
  const hero = siteHero();
  if (!hero) return undefined;
  const site = siteKind("site");
  const link = (l?: { label: string; href: string }) =>
    l ? { label: l.label, href: resolveHref(l.href, site), external: isExternalHref(l.href), chat: l.href === "whatsapp" } : undefined;
  return { hero, cta: link(hero.cta), secondary: link(hero.secondary), loop: heroLoopData(hero) };
}

const SITE_HERO_COPY: HeroCopy = {
  headlineWords: [],
  headlineSuffix: "",
  placeholders: [],
  backgroundImage: "",
  logo: "none",
  trustLine: [],
  badges: [],
  formData: heroFormData(),
};
export default SITE_HERO_COPY;
