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

"use client";

// The landing page's logo marquee. Copy and logos: AGENT_LANDING_CONFIG.logos.

import React from "react";
import Image from "next/image";

import { AGENT_LANDING_CONFIG } from "@/components/custom/landing/agent-landing-config";
import type { PageSectionMeta } from "@/components/custom/landing/page-sections";

export function Logos({ id }: { id?: string }) {
  const config = AGENT_LANDING_CONFIG.logos;
  if (!config || config.logos.length === 0) return null;
  const logos = [...config.logos, ...config.logos, ...config.logos];

  return (
    <section
      id={id}
      className="w-full bg-white dark:bg-[#0a0a0a] py-12 border-y border-zinc-100 dark:border-zinc-900 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
            {config.eyebrow}
          </p>

          <div className="w-full relative flex overflow-hidden mask-image-linear-gradient group">
            <div
              className="flex items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500 whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused]"
              style={{ animationDuration: "20s" }}
            >
              {logos.map((logo, idx) => (
                <div
                  key={`${logo.name}-${idx}`}
                  className="relative flex-shrink-0 h-8 w-24 md:h-12 md:w-40 flex items-center justify-center"
                >
                  <Image
                    src={logo.url}
                    alt={logo.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * What this section adds to base_sdk's landing host when registered in
 * components/custom/landing/page-sections.ts: its place in the
 * page order (after the chat section). It is not a floating-nav stop.
 */
export const meta: PageSectionMeta = { order: 20, nav: [] };

export default Logos;
