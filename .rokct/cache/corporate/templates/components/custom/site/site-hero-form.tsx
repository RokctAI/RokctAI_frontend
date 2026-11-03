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

import React, { useEffect, useMemo, useRef } from "react";
import Link from "next/link";

import type { HeroFormProps } from "@/components/custom/landing/hero-form";
import type { SiteHeroSection } from "@/lib/site-data/kinds";

import { Bottle, ROLL_STEP, SiteArtView, WhatsAppGlyph } from "./site-art";
import {
  LOOP_HOLD,
  LOOP_UNIT,
  SCENE_PRIVATE_LABEL,
  loopFrame,
  loopSceneAt,
  type LoopGeo,
  type LoopKey,
  type LoopTag,
} from "./site-hero-loop";
import type { SiteSize } from "./site-sizes";
import { sizeBottleSvg, type SizeMl } from "./site-sizes-art";
import { svgElements } from "./site-svg";

export interface SiteHeroLink {
  label: string;
  href: string;
  external: boolean;
  /** The link opens the site's WhatsApp chat (drawn with the WhatsApp glyph). */
  chat: boolean;
}

/** 1.7.0: the words and sizes of the hero's sizes scene (see ./site-hero-copy.ts). */
export interface SiteHeroLoopData {
  eyebrow?: string;
  lines: string[];
  accentLine: number;
  lede?: string;
  facts: string[];
  sizes: SiteSize[];
}

export interface SiteHeroFormData {
  hero: SiteHeroSection;
  cta?: SiteHeroLink;
  secondary?: SiteHeroLink;
  loop?: SiteHeroLoopData;
}

function TruckGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 6h13v10H1zM14 10h4l4 4v2h-8" />
      <circle cx="5.5" cy="17.5" r="1.8" />
      <circle cx="18" cy="17.5" r="1.8" />
    </svg>
  );
}

/**
 * The price tag. 1.7.0: each line of `tag.text` after the first is a
 * delivery line, under a rule with a truck ("Nationwide delivery").
 */
function HeroTag({ tag, className, style }: { tag: NonNullable<SiteHeroSection["tag"]>; className: string; style?: React.CSSProperties }) {
  const [line, ...more] = (tag.text ?? "").split("\n");
  return (
    <div className={className} style={style} data-tag="tpl">
      <b>{tag.price}</b>
      {line && <span>{line}</span>}
      {more.filter(Boolean).map((m) => (
        <em key={m} className="cs-hero-tag-line">
          <TruckGlyph />
          {m}
        </em>
      ))}
    </div>
  );
}

function HeroCopy({
  eyebrow,
  lines,
  accentLine,
  lede,
  facts,
  cta,
  secondary,
  heading,
}: {
  eyebrow?: string;
  lines: string[];
  accentLine?: number;
  lede?: string;
  facts?: string[];
  cta?: SiteHeroLink;
  secondary?: SiteHeroLink;
  heading: "h1" | "h2";
}) {
  const H = heading;
  return (
    <>
      {eyebrow && <p className="cs-hero-eyebrow cs-rise">{eyebrow}</p>}
      <H className="cs-hero-h1 cs-rise">
        {lines.map((line, i) => (
          <span key={`${i}-${line}`} className={`block ${i === accentLine ? "accent" : ""}`}>
            {line}
          </span>
        ))}
      </H>
      {lede && <p className="cs-hero-lede cs-rise d1">{lede}</p>}
      {(cta || secondary) && (
        <div className="cs-rise d2 flex flex-col gap-3 sm:flex-row">
          {cta && <HeroLink link={cta} className="cs-btn cs-btn-white" glyph />}
          {secondary && <HeroLink link={secondary} className="cs-btn cs-btn-light" />}
        </div>
      )}
      {facts && facts.length > 0 && (
        <ul className="cs-hero-facts cs-rise d3">
          {facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      )}
    </>
  );
}

const SIZE_KEY: Record<SizeMl, LoopKey> = { 500: "05", 1500: "15", 5000: "5l" };
const SIZE_TAG: Record<SizeMl, LoopTag> = { 500: "t05", 1500: "t15", 5000: "t5l" };
/** The private-label bottle is site-art.tsx's 500 ml Bottle: 220 units wide to the foot at y 600, in a 240-wide box. */
const PL_GEO: LoopGeo = { w: 220 * LOOP_UNIT, fh: 600 * LOOP_UNIT };

function px(v: number) {
  return `${v}px`;
}

/**
 * 1.7.0: the poster hero as a loop (the three-size render Ray approved).
 * The server draws the private-label scene; the client then holds it while
 * the bottle rolls through its labels, moves to the sizes (the private-label
 * bottle leaves, the 1.5 L straightens and shrinks into place, the 500 ml
 * and the 5 L come in), holds them and moves back, for ever. The loop stops
 * while the tab is hidden or the hero is off screen; with reduced motion it
 * never starts, so the private-label scene stands still.
 */
function LoopHero({ data, loop }: { data: SiteHeroFormData; loop: SiteHeroLoopData }) {
  const { hero, cta, secondary } = data;
  const front = hero.art!.front as Extract<NonNullable<SiteHeroSection["art"]>["front"], { kind: "bottle" }>;
  const back = hero.art!.back as Extract<NonNullable<SiteHeroSection["art"]>["back"], { kind: "bottle" }>;
  const root = useRef<HTMLDivElement>(null);
  const bottles = useMemo(
    () =>
      loop.sizes.map((size) => {
        const b = sizeBottleSvg(`hero-${size.ml}`, {
          ml: size.ml,
          sizeText: size.label,
          labelBg: back.label.bg,
          art: back.label.art,
          cap: back.cap,
        });
        return { size, key: SIZE_KEY[size.ml], b, geo: { w: b.W * LOOP_UNIT, fh: (b.footY - b.top) * LOOP_UNIT } };
      }),
    [loop.sizes, back],
  );
  const geo = useMemo(() => {
    const g = { pl: PL_GEO } as Record<LoopKey, LoopGeo>;
    for (const b of bottles) g[b.key] = b.geo;
    return g;
  }, [bottles]);
  const first = loopFrame(SCENE_PRIVATE_LABEL, geo);
  const holdLabel = Math.max(LOOP_HOLD, (1 + (front.labels?.length ?? 0)) * ROLL_STEP);

  useEffect(() => {
    const el = root.current;
    if (!el || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const q = <T extends HTMLElement>(sel: string) => el.querySelector<T>(sel);
    const items = {
      bottles: Object.fromEntries((["5l", "15", "05", "pl"] as LoopKey[]).map((k) => [k, q(`[data-b="${k}"]`)])) as Record<LoopKey, HTMLElement | null>,
      tags: Object.fromEntries((["t05", "t15", "t5l", "tpl"] as LoopTag[]).map((k) => [k, q(`[data-tag="${k}"]`)])) as Record<LoopTag, HTMLElement | null>,
      a: q('[data-panel="a"]'),
      b: q('[data-panel="b"]'),
      floor: q("[data-floor]"),
    };
    let elapsed = 0;
    let last = 0;
    let raf = 0;
    let onScreen = true;
    let lastScene = SCENE_PRIVATE_LABEL;
    let activeA = false;
    const restartRoll = () => {
      for (const a of items.bottles.pl?.getAnimations({ subtree: true }) ?? []) {
        if ((a as CSSAnimation).animationName?.endsWith("-roll")) a.currentTime = 0;
      }
    };
    const draw = (scene: number) => {
      const f = loopFrame(scene, geo);
      for (const k of Object.keys(items.bottles) as LoopKey[]) {
        const n = items.bottles[k];
        if (!n) continue;
        const v = f.bottles[k];
        n.style.left = px(v.left);
        n.style.top = px(v.top);
        n.style.transform = v.transform;
        n.style.opacity = String(v.opacity);
        n.style.setProperty("--cs-level", `${v.level}deg`);
      }
      for (const k of Object.keys(items.tags) as LoopTag[]) {
        const n = items.tags[k];
        if (!n) continue;
        n.style.opacity = String(f.tags[k].opacity);
        n.style.transform = f.tags[k].transform;
      }
      for (const [n, p] of [[items.a, f.panelA], [items.b, f.panelB]] as const) {
        if (!n) continue;
        n.style.opacity = String(p.opacity);
        n.style.transform = p.transform;
      }
      if (items.floor) items.floor.style.opacity = String(f.floor);
      const nowA = f.panelA.opacity > 0.5;
      if (nowA !== activeA) {
        activeA = nowA;
        items.a?.toggleAttribute("inert", !nowA);
        items.a?.setAttribute("aria-hidden", String(!nowA));
        items.b?.toggleAttribute("inert", nowA);
        items.b?.setAttribute("aria-hidden", String(nowA));
      }
      if (scene === SCENE_PRIVATE_LABEL && lastScene !== SCENE_PRIVATE_LABEL) restartRoll();
      lastScene = scene;
    };
    const tick = (now: number) => {
      elapsed += Math.min(100, now - last) / 1000;
      last = now;
      draw(loopSceneAt(elapsed, holdLabel));
      raf = requestAnimationFrame(tick);
    };
    const sync = () => {
      const run = onScreen && document.visibilityState === "visible";
      el.classList.toggle("paused", !run);
      if (run && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      } else if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const io = new IntersectionObserver((entries) => {
      onScreen = entries.some((e) => e.isIntersecting);
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    restartRoll();
    sync();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [geo, holdLabel]);

  const tagStyle = (id: LoopTag) => ({ left: px(first.tags[id].left), top: px(first.tags[id].top), opacity: first.tags[id].opacity, transform: first.tags[id].transform });
  const bottleStyle = (k: LoopKey, w: number, fh: number) => {
    const v = first.bottles[k];
    return {
      width: px(+w.toFixed(2)),
      left: px(v.left),
      top: px(v.top),
      transform: v.transform,
      opacity: v.opacity,
      transformOrigin: k === "pl" ? `${w / 2}px ${fh}px` : `50% ${fh.toFixed(2)}px`,
      "--cs-level": `${v.level}deg`,
    } as React.CSSProperties;
  };
  return (
    <div ref={root} className="cs-hero poster loop">
      <div aria-hidden="true" className="cs-hero-glow" />
      <div aria-hidden="true" className="cs-hero-stripes" />
      <div className="cs-hero-grid">
        <div className="cs-hero-panels">
          <div className="cs-hero-panel flex flex-col gap-7" data-panel="b" style={first.panelB}>
            <HeroCopy
              eyebrow={hero.eyebrow}
              lines={hero.lines}
              accentLine={hero.accentLine}
              lede={hero.lede}
              facts={hero.facts}
              cta={cta}
              secondary={secondary}
              heading="h1"
            />
          </div>
          <div className="cs-hero-panel flex flex-col gap-7" data-panel="a" style={first.panelA} inert aria-hidden="true">
            <HeroCopy
              eyebrow={loop.eyebrow}
              lines={loop.lines}
              accentLine={loop.accentLine}
              lede={loop.lede}
              facts={loop.facts}
              cta={cta}
              secondary={secondary}
              heading="h2"
            />
          </div>
        </div>
        <div className="cs-loop-frame">
          <div className="cs-loop-stage">
            <div aria-hidden="true" className="cs-loop-floor" data-floor="" style={{ opacity: first.floor }} />
            {bottles
              .slice()
              .sort((a, b) => b.size.ml - a.size.ml)
              .map(({ key, b, geo: g, size }) => (
                <div
                  key={key}
                  className="cs-loop-bottle"
                  data-b={key}
                  role="img"
                  aria-label={`${size.name} bottle`}
                  style={bottleStyle(key, g.w, g.fh)}
                >
                  {svgElements(b.svg)}
                </div>
              ))}
            <div className="cs-loop-bottle" data-b="pl" style={bottleStyle("pl", PL_GEO.w, PL_GEO.fh)}>
              <Bottle id="hero-main" label={front.label} labels={front.labels} cap={front.cap} height={620 * LOOP_UNIT} />
            </div>
            {bottles.map(({ size }) => (
              <div key={size.ml} className="cs-loop-tag" data-tag={SIZE_TAG[size.ml]} style={tagStyle(SIZE_TAG[size.ml])} aria-hidden="true">
                <b>{size.name}</b>
                {size.note && <small>{size.note}</small>}
              </div>
            ))}
            {hero.tag && <HeroTag tag={hero.tag} className="cs-loop-tag price" style={tagStyle("tpl")} />}
          </div>
        </div>
      </div>
    </div>
  );
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
  if (data.loop) return <LoopHero data={data} loop={data.loop} />;
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
            {hero.tag && <HeroTag tag={hero.tag} className="cs-hero-tag" />}
          </div>
        )}
      </div>
    </div>
  );
}
