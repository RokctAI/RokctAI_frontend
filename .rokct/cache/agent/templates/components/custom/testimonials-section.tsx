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

// The landing page's testimonial marquee. Quotes: AGENT_LANDING_CONFIG.testimonials.

import React from "react";
import Image from "next/image";

import { AGENT_LANDING_CONFIG } from "@/components/custom/landing/agent-landing-config";
import type { PageSectionMeta } from "@/components/custom/landing/page-sections";

export function TestimonialsSection({ id }: { id?: string }) {
  const config = AGENT_LANDING_CONFIG.testimonials;
  if (!config || config.items.length === 0) return null;
  // Repeated so the marquee never shows a gap.
  const items = [...config.items, ...config.items, ...config.items];

  return (
    <section
      id={id}
      className="w-full bg-[#fafafa] dark:bg-black py-12 md:py-20 overflow-hidden relative border-t border-zinc-200 dark:border-zinc-900 mt-12 md:mt-24"
    >
      <div className="relative flex w-full overflow-hidden py-4 group">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 sm:w-[15%] bg-gradient-to-r from-[#fafafa] to-transparent dark:from-black z-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 sm:w-[15%] bg-gradient-to-l from-[#fafafa] to-transparent dark:from-black z-20" />

        <div className="flex w-max animate-marquee gap-5 py-1 items-center group-hover:[animation-play-state:paused]">
          {items.map((item, i) => (
            <div
              key={`testimonial-${i}`}
              className="flex w-[350px] shrink-0 flex-col justify-between gap-5 rounded-[1.5rem] border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-[#111] p-6 shadow-sm hover:shadow-md transition-shadow h-full"
            >
              <div className="flex flex-col gap-3">
                <h4 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">
                  {item.title}
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-4">
                  {item.text}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-auto border-t border-zinc-100 dark:border-zinc-800/50 pt-4">
                <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                  {item.avatar ? (
                    <Image
                      unoptimized
                      referrerPolicy="no-referrer"
                      src={item.avatar}
                      alt={item.author}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-zinc-400 font-bold uppercase">
                      {item.author.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[200px]">
                    {item.author}
                  </span>
                  <span className="text-xs font-medium text-zinc-500">
                    {item.role}
                  </span>
                </div>
              </div>
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
  order: 90,
  nav: [{ id: "testimonials", label: "Testimonials" }],
};

export default TestimonialsSection;
