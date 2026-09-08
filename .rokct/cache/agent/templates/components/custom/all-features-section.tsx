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

// The landing page's feature grid. Copy and tiles: AGENT_LANDING_CONFIG.features.

import React from "react";
import Image from "next/image";

import { AGENT_LANDING_CONFIG } from "@/components/custom/landing/agent-landing-config";
import type { PageSectionMeta } from "@/components/custom/landing/page-sections";

export function AllFeaturesSection({ id }: { id?: string }) {
  const config = AGENT_LANDING_CONFIG.features;
  if (!config) return null;

  return (
    <section
      id={id}
      className="w-full bg-white dark:bg-black py-20 flex flex-col gap-32"
    >
      <div className="container mx-auto px-4 xl:px-0">
        <div className="flex flex-col items-center text-center gap-6 mb-16">
          <h2 className="text-[32px] md:text-[56px] font-black leading-[1.1] text-zinc-900 dark:text-white tracking-tighter">
            {config.heading}
          </h2>
          <p className="text-xl font-medium text-zinc-500 dark:text-zinc-400 max-w-2xl">
            {config.blurb}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {config.items.map((feature) => (
            <div
              key={feature.name}
              className="group flex flex-col gap-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-[24px] p-4 border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden relative"
            >
              <div className="relative h-[120px] w-full rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                <Image
                  unoptimized
                  src={feature.image}
                  alt={feature.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <h4 className="font-bold text-zinc-900 dark:text-white text-[15px] leading-snug px-1 relative z-10">
                {feature.name}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * What this section adds to base_sdk's landing host when registered in
 * components/custom/landing/page-sections.ts: its place in the
 * page order and its floating-nav entry.
 */
export const meta: PageSectionMeta = {
  order: 40,
  nav: [{ id: "features", label: "Features" }],
};

export default AllFeaturesSection;
