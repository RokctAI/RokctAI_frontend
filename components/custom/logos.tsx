/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use client";

import React from "react";
import Image from "next/image";

const LOGOS = [
  {
    name: "Walmart",
    url: "https://cdn.getmerlin.in/cms/Walmart_1_0cd05c542e.png",
  },
  {
    name: "Cisco",
    url: "https://cdn.getmerlin.in/cms/Cisco_1_ab0ee6173d.png",
  },
  {
    name: "Netflix",
    url: "https://cdn.getmerlin.in/cms/Netflix_1_dabb0f82d5.png",
  },
  {
    name: "Pinterest",
    url: "https://cdn.getmerlin.in/cms/Pinterest_1_25eeb74ab0.png",
  },
  {
    name: "Zoom",
    url: "https://cdn.getmerlin.in/cms/Zoom_1_b5d03a6d69.png",
  },
  {
    name: "Sony",
    url: "https://cdn.getmerlin.in/cms/Sony_1_e475b6ed27.png",
  },
  {
    name: "Ebay",
    url: "https://cdn.getmerlin.in/cms/Ebay_1_dbfa7af44d.png",
  },
  {
    name: "Uber",
    url: "https://cdn.getmerlin.in/cms/Uber_1_338311f3dc.png",
  },
];

export function Logos() {
  return (
    <section className="w-full bg-white dark:bg-[#0a0a0a] py-12 border-y border-zinc-100 dark:border-zinc-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
            Trusted by professionals at
          </p>

          <div className="w-full relative flex overflow-hidden mask-image-linear-gradient group">
            <div
              className="flex items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500 whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused]"
              style={{ animationDuration: "20s" }}
            >
              {[...LOGOS, ...LOGOS, ...LOGOS].map((logo, idx) => (
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
