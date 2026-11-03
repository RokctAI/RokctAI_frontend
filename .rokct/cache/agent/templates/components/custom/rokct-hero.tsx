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

// rokct.ai's hero (1.24.0), the first section of the redesign Ray approved
// on 2026-11-01: the rotating "Everything is a chat away." headline, the
// two calls to action and, beside them, the sample conversation with ROK.
//
// The landing host (base_sdk app/landing/page.tsx) always draws its own
// hero frame; this SDK's stylesheet keeps that frame off rokct.ai
// (rokct-landing.css, `.rk-landing #hero`), and this section, at a
// negative order, is drawn in its place, before the frame, outside the
// block base hides while its frame shows search results. It is also the
// section that carries the page's root class (RK_ROOT_CLASS: the scope of
// every rokct-landing.css rule and the three font variables), so the
// tokens are on the root that wraps the header in the first HTML.
//
// Server-safe entry: `meta` and the default component, no "use client";
// what moves (the word, the console, the reveal on scroll) is
// rokct-hero.client.tsx.

import React from "react";
import { RiArrowRightLine } from "@remixicon/react";

import { RokctHeroConsole, RokctHeroWord, RokctMotion } from "@/components/custom/rokct-hero.client";
import { RK_HERO, RK_ANCHORS } from "@/components/custom/landing/rokct-landing-content";
import { RK_ROOT_CLASS } from "@/components/custom/landing/rokct-landing-classes";
import { RkIcon, RkMark } from "@/components/custom/landing/rokct-ui";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";

export const meta: PageSectionMeta = {
  order: -1,
  nav: [{ id: RK_ANCHORS.ask, label: "Ask ROK" }],
  rootClass: RK_ROOT_CLASS,
};

export default function RokctHeroSection({ id, signupUrl }: PageSectionProps) {
  return (
    <section className="rk-hero" id={id}>
      <RokctMotion />
      <RkMark className="rk-hero-bg" />
      <div className="rk-wrap rk-hero-grid">
        <div>
          <div className="rk-eyebrow">
            <span className="rk-dot" />
            {RK_HERO.eyebrow}
          </div>
          <h1 className="rk-h1">
            <RokctHeroWord words={RK_HERO.words} intervalMs={RK_HERO.wordIntervalMs} />
            <br />
            {RK_HERO.tail[0]}
            <br />
            {RK_HERO.tail[1]}
            <span className="rk-caret" aria-hidden="true" />
          </h1>
          <p className="rk-lede">{RK_HERO.lede}</p>
          <div className="rk-cta">
            <a className="rk-btn rk-btn-brand" href={signupUrl}>
              {RK_HERO.primary} <RiArrowRightLine className="rk-ico" aria-hidden="true" />
            </a>
            <a className="rk-btn rk-btn-line" href={`#${RK_ANCHORS.platform}`}>
              {RK_HERO.secondary}
            </a>
          </div>
          <div className="rk-hero-meta">
            {RK_HERO.meta.map((item) => (
              <span key={item.text}>
                <RkIcon name={item.icon} />
                {item.text}
              </span>
            ))}
          </div>
        </div>
        <RokctHeroConsole />
      </div>
    </section>
  );
}
