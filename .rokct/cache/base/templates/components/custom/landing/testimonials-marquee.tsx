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

// The auto-scrolling testimonials row: rokct.ai's (agent_sdk's
// testimonials-section.tsx, the marquee of quote cards that pauses under
// the pointer) as one generic component, so every shell can run the same
// row over its own quotes (Ray, 2026-09-09: Supacharge is to inherit
// rokct.ai's auto-scrolling testimonials).
//
// The DOM is agent_sdk's, element for element, and the default classes are
// its class strings verbatim - so a section that renders this with no
// overrides is identical to rokct.ai's row, apart from the animation class:
// `animate-marquee` lived only in rokctai_frontend's tailwind.config.ts, so
// here the track carries `rokct-marquee` from ../../../app/styles/
// rokct-marquee.css, which this file imports itself (a global stylesheet
// may be imported from any component under the App Router). The two class
// strings a shell most wants to retheme are props: `fadeClassName` for the
// edge fades (they must match the section's ground) and `cardClassName`
// for the card.
//
// Generic chrome: no product name and no copy - every quote arrives as an
// item - and no consumer here; a home SDK's own testimonials section
// renders it.

import React from "react";
import Image from "next/image";

import "@/app/styles/rokct-marquee.css";

export interface TestimonialsMarqueeItem {
  title?: string;
  text: string;
  author: string;
  role?: string;
  /** Portrait URL; an initial stands in when absent. */
  avatar?: string;
}

export interface TestimonialsMarqueeProps {
  items: TestimonialsMarqueeItem[];
  /** Extra classes on the outer `.group` wrapper. */
  className?: string;
  /**
   * The gradient start of the two edge fades - the part that must match
   * the ground the row sits on. agent_sdk's value by default.
   */
  fadeClassName?: string;
  /** The card's classes in full. agent_sdk's value by default. */
  cardClassName?: string;
}

const DEFAULT_FADE = "from-[#fafafa] dark:from-black";
const DEFAULT_CARD =
  "flex w-[350px] shrink-0 flex-col justify-between gap-5 rounded-[1.5rem] border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-[#111] p-6 shadow-sm hover:shadow-md transition-shadow h-full";

export function TestimonialsMarquee({
  items,
  className = "",
  fadeClassName = DEFAULT_FADE,
  cardClassName = DEFAULT_CARD,
}: TestimonialsMarqueeProps) {
  if (items.length === 0) return null;
  // Repeated so the marquee never shows a gap: the animation travels one
  // third of the track, which is exactly one copy.
  const tripled = [...items, ...items, ...items];

  return (
    <div className={`relative flex w-full overflow-hidden py-4 group ${className}`}>
      <div
        className={`pointer-events-none absolute inset-y-0 left-0 w-1/6 sm:w-[15%] bg-gradient-to-r to-transparent z-20 ${fadeClassName}`}
      />
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 w-1/6 sm:w-[15%] bg-gradient-to-l to-transparent z-20 ${fadeClassName}`}
      />

      <div className="flex w-max rokct-marquee rokct-marquee-track gap-5 py-1 items-center group-hover:[animation-play-state:paused]">
        {tripled.map((item, i) => (
          <div key={`testimonial-${i}`} className={cardClassName}>
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
  );
}

export default TestimonialsMarquee;
