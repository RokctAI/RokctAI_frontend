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

// rokct.ai's funding band (1.24.0): "Grants, funders and tenders, found by
// asking.", the registry's counts and, beside them, the finder. The finder
// is the live opportunities search the old hero carried
// (landing/agent-opportunities.tsx, unchanged): a visitor describes the
// business, the search runs through the searchPublicOpportunities server
// action and each result links to its /opportunities page. Until a search
// is made the finder shows the concept's four labelled samples.
// Server-safe entry; the finder is rokct-funding.client.tsx. The header's
// "Funding" link scrolls here.

import React from "react";

import { RokctFinder } from "@/components/custom/rokct-funding.client";
import { RK_ANCHORS, RK_FUNDING } from "@/components/custom/landing/rokct-landing-content";
import { RkAsk, RkMark, rkLines } from "@/components/custom/landing/rokct-ui";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";

export const meta: PageSectionMeta = {
  order: 30,
  nav: [{ id: RK_ANCHORS.funding, label: "Funding" }],
};

export default function RokctFundingSection({ id, signupUrl }: PageSectionProps) {
  return (
    <section className="rk-band" id={id}>
      <RkMark className="rk-band-r" />
      <div className="rk-wrap rk-opp">
        <div className="rk-reveal">
          <RkAsk>{RK_FUNDING.ask}</RkAsk>
          <h2 className="rk-h2">{rkLines(RK_FUNDING.heading)}</h2>
          <p className="rk-lede">{RK_FUNDING.lede}</p>
          <div className="rk-counts">
            {RK_FUNDING.counts.map((count) => (
              <div className="rk-count" key={count.label}>
                <b>{count.n}</b>
                <span>{count.label}</span>
              </div>
            ))}
          </div>
          <div className="rk-src">{RK_FUNDING.source}</div>
        </div>
        <RokctFinder signupUrl={signupUrl} />
      </div>
    </section>
  );
}
