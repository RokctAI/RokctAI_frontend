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

// rokct.ai's "One platform. Every desk in the business." section (1.24.0):
// six tabs (Money, People, Sales, Operations, Commerce, Reach), each
// opening a pane with the question an owner would ask, what the module
// does and a sample exchange. Server-safe entry; the tab state is
// rokct-platform.client.tsx. The header's "Platform" link scrolls here.

import React from "react";

import { RokctModules } from "@/components/custom/rokct-platform.client";
import { RK_ANCHORS, RK_PLATFORM } from "@/components/custom/landing/rokct-landing-content";
import { RkAsk, rkLines } from "@/components/custom/landing/rokct-ui";
import type {
  PageSectionMeta,
  PageSectionProps,
} from "@/components/custom/landing/page-sections";

export const meta: PageSectionMeta = {
  order: 10,
  nav: [{ id: RK_ANCHORS.platform, label: "Platform" }],
};

export default function RokctPlatformSection({ id }: PageSectionProps) {
  return (
    <section className="rk-s" id={id}>
      <div className="rk-wrap">
        <RkAsk className="rk-reveal">{RK_PLATFORM.ask}</RkAsk>
        <div className="rk-s-head rk-reveal">
          <h2 className="rk-h2">{rkLines(RK_PLATFORM.heading)}</h2>
          <p className="rk-lede">{RK_PLATFORM.lede}</p>
        </div>
        <RokctModules />
      </div>
    </section>
  );
}
