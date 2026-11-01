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


// The section library of a local-data site (corporate_sdk 1.4.0): one
// server component per data/sections.json type - intro, steps, pricing,
// gallery, facts, order, contact (the hero is ./site-hero-form.tsx) - each
// drawn from its section's fields, its `variant` (a layout) and its `tone`
// (the ground). Nothing here names a client; every word, price, colour and
// picture comes from data/.
import React from "react";

import type {
  SiteContactSection,
  SiteFactsSection,
  SiteGallerySection,
  SiteIdentity,
  SiteIntroSection,
  SiteOrderSection,
  SitePricingSection,
  SiteSection,
  SiteSectionTone,
  SiteStepsSection,
} from "@/lib/site-data/kinds";

import { SiteArtView, Stamp, StepGlyph, Wave } from "./site-art";
import { SiteOrderForm } from "./site-order-form.client";
import { fillPriceWords } from "./site-price";
import { SitePricingSlider } from "./site-pricing-slider.client";
import { siteKind, whatsappHref } from "./site-source";

function toneClass(tone: SiteSectionTone | undefined, fallback: SiteSectionTone = "paper"): string {
  const t = tone ?? fallback;
  return t === "paper" ? "" : `cs-tone-${t}`;
}

function Heading({ eyebrow, heading, className = "" }: { eyebrow?: string; heading: string; className?: string }) {
  return (
    <>
      {eyebrow && <p className={`cs-eyebrow ${className}`}>{eyebrow}</p>}
      <h2 className="cs-display cs-h2">{heading}</h2>
    </>
  );
}

export function SiteIntro({ id, s }: { id?: string; s: SiteIntroSection }) {
  const plain = s.variant === "plain" || !s.stamp;
  return (
    <section id={id} className={`cs-intro ${plain ? "plain" : "stamp"} w-full py-14 md:py-20 ${toneClass(s.tone)}`}>
      <div className={`container mx-auto grid max-w-6xl items-center gap-10 px-4 xl:px-0 ${plain ? "" : "md:grid-cols-[1fr_auto] md:gap-16"}`}>
        <p className="text-xl leading-relaxed text-[var(--cs-ink)] md:text-[1.6rem] md:leading-snug">
          {s.year && <span className="cs-display mr-2 text-[2.6rem] text-[var(--cs-brand-text)] md:text-[3.4rem]">{s.year}</span>}
          {s.text}
        </p>
        {!plain && s.stamp && (
          <div className="justify-self-center md:justify-self-end">
            <Stamp id={`${id ?? "intro"}-stamp`} lines={s.stamp.lines} center={s.stamp.center} size={170} />
          </div>
        )}
      </div>
    </section>
  );
}

export function SiteSteps({ id, s }: { id?: string; s: SiteStepsSection }) {
  const band = (s.variant ?? "band") === "band";
  return (
    <section id={id} className={`cs-steps ${band ? "cs-band band" : `cards ${toneClass(s.tone)}`} cs-section w-full`}>
      {band && <Wave className="cs-band-wave top" />}
      <div className="container mx-auto flex max-w-6xl flex-col gap-12 px-4 xl:px-0">
        <div className="flex flex-col gap-5 md:max-w-3xl">
          <Heading eyebrow={s.eyebrow} heading={s.heading} />
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {s.steps.map((step, i) => (
            <li key={step.title} className="cs-step">
              <div className="flex items-start justify-between">
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <StepGlyph icon={step.icon} n={i} />
              </div>
              <h3>{step.title}</h3>
              {step.text && <p>{step.text}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function SitePricing({ id, s, site }: { id?: string; s: SitePricingSection; site?: SiteIdentity }) {
  const pricing = siteKind("pricing");
  const tiers = pricing?.tiers ?? [];
  const chat = whatsappHref(site);
  return (
    <section id={id} className={`cs-section w-full ${toneClass(s.tone)}`}>
      <div className="container mx-auto flex max-w-6xl flex-col gap-12 px-4 xl:px-0">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="flex flex-col gap-5">
            <Heading eyebrow={s.eyebrow} heading={s.heading} />
          </div>
          {s.note && <p className="cs-lede lg:pb-2">{s.note}</p>}
        </div>

        <div className={`grid gap-4 ${tiers.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {tiers.map((tier, i) => {
            // 1.5.0: a tier may carry a fine line, a slider and art drawn the card's full height.
            const words = (
              <>
                <div className="flex items-center justify-between gap-3">
                  <h3>{tier.name}</h3>
                  {tier.best && pricing?.bestLabel && <span className="cs-chip sun">{pricing.bestLabel}</span>}
                </div>
                <div className={tier.art ? "flex flex-col gap-3" : "flex items-end gap-3"}>
                  <span className="price">{tier.price}</span>
                  {tier.unit && <span className={`unit ${tier.art ? "" : "pb-2"}`}>{tier.unit}</span>}
                </div>
                {tier.detail && <p>{tier.detail}</p>}
                {tier.fine && (
                  <p className="fine">
                    {tier.fine.strong && <b>{fillPriceWords(tier.fine.strong, { price: tier.price, perCase: pricing?.perCase })}</b>}
                    {fillPriceWords(tier.fine.text, { price: tier.price, perCase: pricing?.perCase })}
                  </p>
                )}
                {tier.slider && <SitePricingSlider slider={tier.slider} price={tier.price} perCase={pricing?.perCase} />}
                {pricing?.ctaLabel && (
                  <a
                    href={chat}
                    target="_blank"
                    rel="noopener"
                    className={`cs-btn mt-auto self-start ${tier.best ? "cs-btn-white" : "cs-btn-brand"}`}
                  >
                    {pricing.ctaLabel}
                  </a>
                )}
              </>
            );
            return (
              <article key={tier.name} className={`cs-card cs-tier ${tier.best ? "best" : ""} ${tier.art ? "has-art" : ""}`}>
                {tier.art ? (
                  <>
                    <div className="words">{words}</div>
                    <div className="art">
                      <SiteArtView art={tier.art} id={`tier-${i}-art`} height={480} />
                    </div>
                  </>
                ) : (
                  words
                )}
              </article>
            );
          })}
        </div>

        {s.own && (
          <div className="cs-own grid items-center gap-8 overflow-hidden md:grid-cols-[1fr_auto]">
            <div className="flex flex-col gap-4">
              {s.own.eyebrow && <p className="cs-eyebrow">{s.own.eyebrow}</p>}
              <h3 className="cs-display text-4xl md:text-5xl">{s.own.heading}</h3>
              {s.own.text && <p className="cs-lede max-w-xl">{s.own.text}</p>}
            </div>
            {s.own.art && (
              <figure className="flex justify-center md:pr-6">
                <SiteArtView art={s.own.art} id="own-art" height={300} />
              </figure>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export function SiteGallery({ id, s }: { id?: string; s: SiteGallerySection }) {
  const grid = s.variant === "grid";
  return (
    <section id={id} className={`cs-section w-full ${toneClass(s.tone, "alt")}`}>
      <div className="container mx-auto flex max-w-6xl flex-col gap-12 px-4 xl:px-0">
        <div className="flex flex-col gap-5 text-center md:mx-auto md:max-w-2xl md:items-center">
          <Heading eyebrow={s.eyebrow} heading={s.heading} />
          {s.blurb && <p className="cs-lede">{s.blurb}</p>}
        </div>
        <ul className={`grid gap-3 sm:gap-4 ${grid ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-2 lg:grid-cols-4"}`}>
          {s.items.map((item, i) => (
            <li key={item.title} className={`cs-use ${grid ? "grid" : ""}`}>
              <div className="shelf">
                <SiteArtView art={item.art} id={`use-${i}`} height={grid ? 320 : 250} />
              </div>
              <h3>{item.title}</h3>
              {item.text && <p>{item.text}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function SiteFacts({ id, s }: { id?: string; s: SiteFactsSection }) {
  const band = (s.variant ?? "band") === "band";
  const tone = s.tone ?? "brand";
  return (
    <section
      id={id}
      className={`cs-facts ${band ? `cs-band ${tone === "brand" ? "brand" : ""}` : `plain ${toneClass(s.tone)}`} cs-section w-full`}
    >
      {band && <Wave className="cs-band-wave top" />}
      <div className="container mx-auto flex max-w-6xl flex-col gap-12 px-4 xl:px-0">
        <div className={`grid gap-10 lg:items-start lg:gap-16 ${s.table ? "lg:grid-cols-[0.95fr_1.05fr]" : ""}`}>
          <div className="flex flex-col gap-6">
            <Heading eyebrow={s.eyebrow} heading={s.heading} />
            {s.blurb && <p className="cs-lede max-w-xl">{s.blurb}</p>}
            {s.stats && s.stats.length > 0 && (
              <div className="mt-2 flex gap-4">
                {s.stats.map((stat) => (
                  <div key={stat.label} className="cs-big-stat">
                    <small>{stat.label}</small>
                    <b>{stat.value}</b>
                  </div>
                ))}
              </div>
            )}
          </div>
          {s.table && (
            <figure className="cs-comp">
              <figcaption>
                <span>{s.table.heading}</span>
                {s.table.note && <small>{s.table.note}</small>}
              </figcaption>
              <dl>
                {s.table.rows.map((r) => (
                  <div key={r.name}>
                    <dt>
                      {r.name} {r.symbol && <span>{r.symbol}</span>}
                    </dt>
                    <dd>{r.value}</dd>
                  </div>
                ))}
              </dl>
            </figure>
          )}
        </div>
        {s.chain && s.chain.length > 0 && (
          <ol className="cs-chain">
            {s.chain.map((step) => (
              <li key={step.label}>
                <small>{step.label}</small>
                <b>{step.value}</b>
              </li>
            ))}
          </ol>
        )}
      </div>
      {band && <Wave className="cs-band-wave bottom" />}
    </section>
  );
}

export function SiteOrder({ id, s, site }: { id?: string; s: SiteOrderSection; site?: SiteIdentity }) {
  const order = siteKind("order");
  const pricing = siteKind("pricing");
  return (
    <section id={id} className={`cs-section w-full ${toneClass(s.tone)}`}>
      <div className="container mx-auto max-w-6xl px-4 xl:px-0">
        <div className="cs-card grid gap-10 overflow-hidden p-7 md:grid-cols-[0.9fr_1.1fr] md:p-12">
          <div className="flex flex-col gap-5">
            <Heading eyebrow={s.eyebrow} heading={s.heading} />
            {s.blurb && <p className="cs-lede">{s.blurb}</p>}
          </div>
          {order && <SiteOrderForm order={order} tiers={pricing?.tiers ?? []} chat={whatsappHref(site)} />}
        </div>
      </div>
    </section>
  );
}

export function SiteContact({ id, s, site }: { id?: string; s: SiteContactSection; site?: SiteIdentity }) {
  const band = (s.variant ?? "band") === "band";
  const tone = s.tone ?? "brand";
  return (
    <section id={id} className={`${band ? `cs-band ${tone === "brand" ? "brand" : ""}` : toneClass(s.tone)} cs-section w-full`}>
      <div className="container mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-[1fr_auto] xl:px-0">
        <div className="flex flex-col gap-5">
          <Heading eyebrow={s.eyebrow} heading={s.heading} />
          {s.blurb && <p className="cs-lede max-w-xl">{s.blurb}</p>}
          {s.note && <p className={`text-sm ${band ? "text-white/75" : "text-[var(--cs-sec)]"}`}>{s.note}</p>}
        </div>
        {site?.whatsapp && (
          <a
            href={whatsappHref(site)}
            target="_blank"
            rel="noopener"
            className="group flex flex-col gap-2 rounded-[28px] bg-white p-7 shadow-[0_30px_60px_-30px_rgba(0,0,0,.6)] transition-transform hover:-translate-y-1 md:min-w-[320px]"
            style={{ color: "var(--cs-l-ink)" }}
          >
            <span className="text-xs font-bold uppercase tracking-[0.18em] opacity-60">{s.card?.label ?? "WhatsApp"}</span>
            <span className="cs-num text-5xl md:text-6xl">{site.whatsapp.display}</span>
            {s.card?.action && (
              <span className="mt-2 inline-flex items-center gap-2 text-sm font-bold" style={{ color: "var(--cs-brand)" }}>
                {s.card.action}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </span>
            )}
          </a>
        )}
      </div>
    </section>
  );
}

/** One data section, drawn by its type; null for a hero (the hero form draws it). */
export function SiteSectionView({ id, section }: { id?: string; section: SiteSection }) {
  const site = siteKind("site");
  switch (section.type) {
    case "intro":
      return <SiteIntro id={id} s={section} />;
    case "steps":
      return <SiteSteps id={id} s={section} />;
    case "pricing":
      return <SitePricing id={id} s={section} site={site} />;
    case "gallery":
      return <SiteGallery id={id} s={section} />;
    case "facts":
      return <SiteFacts id={id} s={section} />;
    case "order":
      return <SiteOrder id={id} s={section} site={site} />;
    case "contact":
      return <SiteContact id={id} s={section} site={site} />;
    default:
      return null;
  }
}
