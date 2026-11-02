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

// rokct.ai's "You ask. ROK does the work. You stay in charge." section and
// the "A day's work, on one screen." picture grid under it (1.24.0). Both
// are static, so this entry has no client half. The pictures are this
// SDK's own drawings (public/landing/agent/rk-*.svg), served by the shell
// itself. The header's "How it works" link scrolls here.

import React from "react";
import { RiArrowRightLine } from "@remixicon/react";

import {
  RK_ANCHORS,
  RK_HOW,
  RK_MAKES,
  RK_PICTURES,
} from "@/components/custom/landing/rokct-landing-content";
import { RK_R_PATH, RK_R_VIEWBOX, RkAsk, rkLines } from "@/components/custom/landing/rokct-ui";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";

export const meta: PageSectionMeta = {
  order: 20,
  nav: [{ id: RK_ANCHORS.how, label: "How it works" }],
};

/** You ask, ROK works in your company site, the approval comes back: the concept's drawing. */
function HowDiagram() {
  const modules: [number, number, number, string, boolean][] = [
    [724, 70, 98, "Accounts", true],
    [830, 70, 96, "HR", false],
    [724, 114, 98, "Sales", false],
    [830, 114, 96, "Stock", false],
    [724, 158, 98, "Projects", false],
    [830, 158, 96, "Orders", false],
  ];
  return (
    <div className="rk-diagram rk-reveal" aria-hidden="true">
      <svg viewBox="0 0 1160 300">
        <rect className="rk-dg-box" x="0" y="96" width="250" height="108" rx="20" />
        <text className="rk-dg-s" x="24" y="128">YOU ASK</text>
        <text className="rk-dg-t" x="24" y="158">&quot;Pay the supplier for</text>
        <text className="rk-dg-t" x="24" y="180">invoice 0089&quot;</text>
        <path className="rk-dg-flow" d="M250 150 H 430" />
        <circle className="rk-dg-brand" cx="495" cy="150" r="64" />
        <svg x="472" y="122" width="46" height="57" viewBox={RK_R_VIEWBOX} style={{ fill: "var(--rk-on-brand)" }}>
          <path d={RK_R_PATH} />
        </svg>
        <text className="rk-dg-s" x="495" y="240" textAnchor="middle">ROK</text>
        <path className="rk-dg-flow" d="M560 150 H 700" />
        <rect className="rk-dg-box" x="700" y="20" width="250" height="260" rx="22" />
        <text className="rk-dg-s" x="724" y="52">YOUR COMPANY SITE</text>
        <g className="rk-dg-t" style={{ fontSize: "14px" }}>
          {modules.map(([x, y, w, label, lead]) => (
            <g key={label}>
              <rect x={x} y={y} width={w} height="36" rx="10" fill={lead ? "var(--rk-accent-soft)" : "var(--rk-panel-2)"} />
              <text x={x + w / 2} y={y + 23} textAnchor="middle" fill={lead ? "var(--rk-accent-ink)" : undefined}>
                {label}
              </text>
            </g>
          ))}
          <rect x="724" y="202" width="202" height="36" rx="10" fill="none" stroke="var(--rk-line-2)" strokeDasharray="4 5" />
          <text x="742" y="225" fill="var(--rk-ink-3)">+ more as your plan grows</text>
        </g>
        <path className="rk-dg-line" d="M950 150 H 1010" />
        <rect className="rk-dg-box" x="1010" y="96" width="150" height="108" rx="20" />
        <text className="rk-dg-s" x="1030" y="128">APPROVAL</text>
        <text className="rk-dg-t" x="1030" y="158">Finance</text>
        <text className="rk-dg-t" x="1030" y="180">says yes</text>
      </svg>
    </div>
  );
}

export default function RokctHowSection({ id }: PageSectionProps) {
  return (
    <>
      <section className="rk-s rk-flush" id={id}>
        <div className="rk-wrap">
          <RkAsk className="rk-reveal">{RK_HOW.ask}</RkAsk>
          <div className="rk-s-head rk-reveal">
            <h2 className="rk-h2">{rkLines(RK_HOW.heading)}</h2>
            <p className="rk-lede">{RK_HOW.lede}</p>
          </div>
          <div className="rk-how rk-reveal">
            {RK_HOW.steps.map((step) => (
              <div className="rk-step" key={step.n}>
                <div className="rk-n">{step.n}</div>
                <h3 className="rk-h3">{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
          <HowDiagram />
        </div>
      </section>

      <section className="rk-s rk-flush" id="makes">
        <div className="rk-wrap">
          <RkAsk className="rk-reveal">{RK_MAKES.ask}</RkAsk>
          <div className="rk-s-head rk-reveal">
            <h2 className="rk-h2">{rkLines(RK_MAKES.heading)}</h2>
            <p className="rk-lede">{RK_MAKES.lede}</p>
          </div>
          <div className="rk-makes rk-reveal">
            {RK_MAKES.pictures.map((pic) => (
              <figure className="rk-mk" key={pic.file}>
                {/* A plain <img>: the drawings are small SVG files the shell serves itself. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${RK_PICTURES}/${pic.file}`} alt={pic.alt} loading="lazy" width={720} height={500} />
                <figcaption>
                  <b>{pic.title}</b>
                  <span>{pic.text}</span>
                </figcaption>
              </figure>
            ))}
            <div className="rk-mk rk-more">
              <b>{RK_MAKES.more.title}</b>
              <span>{RK_MAKES.more.text}</span>
              <a href={`#${RK_ANCHORS.ask}`} className="rk-more-a">
                {RK_MAKES.more.cta} <RiArrowRightLine className="rk-ico" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
