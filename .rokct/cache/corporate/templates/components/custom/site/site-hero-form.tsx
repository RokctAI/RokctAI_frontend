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


// A local-data site's hero body for base_sdk's hero-form registry, from the
// data/sections.json hero handed over as HeroConfig.formData (see
// ./site-hero-copy.ts). Variant "poster" (the default): the stacked
// headline on the brand ground, the call to action, and the art large - a
// front piece and an optional one behind it, with a price tag. Variant
// "split": the same words on the paper ground and the art in a card.
"use client";

import React from "react";
import Link from "next/link";

import type { HeroFormProps } from "@/components/custom/landing/hero-form";
import type { SiteHeroSection } from "@/lib/site-data/kinds";

import { SiteArtView, WhatsAppGlyph } from "./site-art";

export interface SiteHeroLink {
  label: string;
  href: string;
  external: boolean;
  /** The link opens the site's WhatsApp chat (drawn with the WhatsApp glyph). */
  chat: boolean;
}

export interface SiteHeroFormData {
  hero: SiteHeroSection;
  cta?: SiteHeroLink;
  secondary?: SiteHeroLink;
}

function HeroLink({ link, className, glyph }: { link: SiteHeroLink; className: string; glyph?: boolean }) {
  if (link.external) {
    return (
      <a href={link.href} className={className} target="_blank" rel="noopener">
        {glyph && link.chat && <WhatsAppGlyph />}
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

export default function SiteHeroForm({ hero: config }: HeroFormProps) {
  const data = config.formData as SiteHeroFormData | undefined;
  if (!data) return null;
  const { hero, cta, secondary } = data;
  const variant = hero.variant ?? "poster";
  const front = hero.art?.front;
  const back = hero.art?.back;
  return (
    <div className={`cs-hero ${variant}`}>
      {variant === "poster" && <div aria-hidden="true" className="cs-hero-glow" />}
      {variant === "poster" && <div aria-hidden="true" className="cs-hero-stripes" />}
      <div className="cs-hero-grid">
        <div className="flex flex-col gap-7">
          {hero.eyebrow && <p className="cs-hero-eyebrow cs-rise">{hero.eyebrow}</p>}
          <h1 className="cs-hero-h1 cs-rise">
            {hero.lines.map((line, i) => (
              <span key={`${i}-${line}`} className={`block ${i === hero.accentLine ? "accent" : ""}`}>
                {line}
              </span>
            ))}
          </h1>
          {hero.lede && <p className="cs-hero-lede cs-rise d1">{hero.lede}</p>}
          {(cta || secondary) && (
            <div className="cs-rise d2 flex flex-col gap-3 sm:flex-row">
              {cta && <HeroLink link={cta} className="cs-btn cs-btn-white" glyph />}
              {secondary && <HeroLink link={secondary} className="cs-btn cs-btn-light" />}
            </div>
          )}
          {hero.facts && hero.facts.length > 0 && (
            <ul className="cs-hero-facts cs-rise d3">
              {hero.facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          )}
        </div>
        {(front || back) && (
          <div className="cs-hero-stage">
            {variant === "poster" ? (
              <>
                <div aria-hidden="true" className="halo" />
                {back && (
                  <div className="back">
                    <SiteArtView art={back} id="hero-back" height={600} />
                  </div>
                )}
                {front && (
                  <div className="main">
                    <SiteArtView art={front} id="hero-main" height={500} />
                  </div>
                )}
              </>
            ) : (
              front && (
                <div className="cs-hero-card">
                  <SiteArtView art={front} id="hero-main" height={480} />
                </div>
              )
            )}
            {hero.tag && (
              <div className="cs-hero-tag">
                <b>{hero.tag.price}</b>
                {hero.tag.text && <span>{hero.tag.text}</span>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
