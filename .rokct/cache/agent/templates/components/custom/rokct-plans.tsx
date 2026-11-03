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

// rokct.ai's plans ladder (1.24.0): "Start with the books. Grow into the
// suite.", the four steps a business climbs, and the line that says where
// the prices are. The prices themselves are the live plan cards
// (./pricing.tsx, order 45, straight after this section and only when the
// platform answered plans); the button scrolls to them, or goes to sign-up
// when there are none. Static, so no client half. The header's "Plans"
// link scrolls here.

import React from "react";
import { RiArrowRightLine, RiCheckLine, RiMoneyDollarCircleLine } from "@remixicon/react";

import { RK_ANCHORS, RK_PLANS } from "@/components/custom/landing/rokct-landing-content";
import { RkAsk, rkLines } from "@/components/custom/landing/rokct-ui";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";

export const meta: PageSectionMeta = {
  order: 40,
  nav: [{ id: RK_ANCHORS.plans, label: "Plans" }],
};

export default function RokctPlansSection({ id, plans, signupUrl }: PageSectionProps) {
  const pricesHref = plans.length > 0 ? `#${RK_ANCHORS.prices}` : signupUrl;
  return (
    <section className="rk-s" id={id}>
      <div className="rk-wrap">
        <RkAsk className="rk-reveal">{RK_PLANS.ask}</RkAsk>
        <div className="rk-s-head rk-reveal">
          <h2 className="rk-h2">{rkLines(RK_PLANS.heading)}</h2>
          <p className="rk-lede">{RK_PLANS.lede}</p>
        </div>
        <div className="rk-ladder rk-reveal">
          {RK_PLANS.rungs.map((rung) => (
            <div className="rk-rung" key={rung.level}>
              <span className="rk-lvl">{rung.level}</span>
              <h3 className="rk-h3">{rung.name}</h3>
              <p>{rung.text}</p>
              <ul className="rk-r-list">
                {rung.items.map((item) => (
                  <li key={item}>
                    <RiCheckLine className="rk-ico" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="rk-plans-foot rk-reveal">
          <span>
            <RiMoneyDollarCircleLine className="rk-ico" aria-hidden="true" />
            &nbsp; {RK_PLANS.foot}
          </span>
          <a className="rk-btn rk-btn-brand" href={pricesHref}>
            {RK_PLANS.cta} <RiArrowRightLine className="rk-ico" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
