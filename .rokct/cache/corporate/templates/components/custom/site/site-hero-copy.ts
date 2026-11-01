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

import type { SiteHeroFormData } from "./site-hero-form";
import { isExternalHref, resolveHref, siteHero, siteKind } from "./site-source";

function heroFormData(): SiteHeroFormData | undefined {
  const hero = siteHero();
  if (!hero) return undefined;
  const site = siteKind("site");
  const link = (l?: { label: string; href: string }) =>
    l ? { label: l.label, href: resolveHref(l.href, site), external: isExternalHref(l.href), chat: l.href === "whatsapp" } : undefined;
  return { hero, cta: link(hero.cta), secondary: link(hero.secondary) };
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
