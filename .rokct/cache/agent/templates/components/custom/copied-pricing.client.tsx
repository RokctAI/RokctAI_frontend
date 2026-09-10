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

// The comparison deck's CLIENT half (since 1.18.0): the active-card state
// and the framer deck, unchanged. Rendered by ./copied-pricing.tsx, the
// section's entry, which holds `meta` where the server can read it.

// The landing page's "one subscription versus many tools" comparison deck:
// two stacked cards with file-divider tabs, the platform's card in front by
// default. Copy, prices and tool rows: AGENT_LANDING_CONFIG.compare. Keeps the
// shell's file name so the composer overwrites the shell copy.

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

import { PLATFORM_NAME } from "@/app/config/platform";
import {
  AGENT_LANDING_CONFIG,
  type CompareOtherCard,
} from "@/components/custom/landing/agent-landing-config";

const SPRING = { type: "spring", stiffness: 300, damping: 30 } as const;

function Period({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <React.Fragment key={line}>
          {i > 0 && <br />}
          {line}
        </React.Fragment>
      ))}
    </>
  );
}

function OtherCard({
  card,
  dimmed,
  muted,
}: {
  card: CompareOtherCard;
  dimmed: boolean;
  /** The card that fans out behind the visible "others" deck. */
  muted?: boolean;
}) {
  return (
    <div
      className={`w-[280px] md:w-[340px] flex flex-col rounded-[2rem] border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 md:px-12 transition-colors duration-300 relative overflow-hidden h-full z-10 ${
        muted
          ? "bg-zinc-50 dark:bg-[#1a1a1a] shadow-xl"
          : "bg-white dark:bg-[#111] shadow-2xl hover:border-zinc-300 dark:hover:border-zinc-700"
      }`}
    >
      {dimmed && (
        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 z-50 rounded-[2rem] pointer-events-none" />
      )}

      <div className="flex items-center gap-3 mb-5 relative z-40">
        <div className="flex -space-x-2">
          <div className="h-8 w-8 rounded-full border-2 border-white dark:border-[#111] overflow-hidden bg-white">
            <Image
              unoptimized
              referrerPolicy="no-referrer"
              src={card.avatar.src}
              alt={card.avatar.alt}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <span className="text-lg font-bold text-zinc-500 dark:text-zinc-400">
          {card.name}
        </span>
      </div>

      <div className="mb-8 relative z-40">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl md:text-6xl font-black text-zinc-900 dark:text-white">
            {card.price}
          </span>
        </div>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1.5 font-medium leading-tight">
          <Period lines={card.period} />
        </p>
      </div>

      <div className="mt-auto space-y-4 relative z-40">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          {card.listHeading}
        </h4>
        <div className="space-y-0">
          {card.items.map((item, i) => (
            <div
              key={item.label}
              className={`flex items-center justify-between py-3 ${
                i < card.items.length - 1
                  ? "border-b border-zinc-100 dark:border-zinc-800/50"
                  : ""
              }`}
            >
              <div className="flex items-center gap-2">
                {item.icon ? (
                  <Image
                    unoptimized
                    referrerPolicy="no-referrer"
                    src={item.icon.src}
                    alt={item.icon.alt}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">
                  {item.label}
                </span>
              </div>
              <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
                {item.price}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CopiedPricing({ id }: { id?: string }) {
  const config = AGENT_LANDING_CONFIG.compare;
  // 0 = the platform card in front, 1 = the "others" deck in front.
  const [active, setActive] = useState(0);
  if (!config) return null;

  const [othersFront, othersBehind] = config.others;
  const platform = config.platform;

  return (
    <section
      id={id}
      className="w-full bg-[#fafafa] dark:bg-black py-12 md:py-20"
    >
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white max-w-2xl leading-[1.1]">
            {config.heading}
          </h2>
          <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 font-medium">
            {config.blurb}
          </p>
        </div>

        <div className="relative min-h-[500px] max-w-4xl mx-auto flex">
          <div className="flex-1 relative h-[550px] lg:h-[500px] w-full">
            {/* The "others" deck. */}
            <motion.div
              onClick={() => setActive(1)}
              className="absolute top-0 bottom-0 cursor-pointer outline-none flex items-stretch"
              animate={{
                zIndex: active === 1 ? 20 : 10,
                left: "0%",
                x: active === 1 ? "0%" : "-15%",
                scale: active === 1 ? 1 : 0.95,
                opacity: active === 1 ? 1 : 0.6,
                filter: active === 1 ? "brightness(1)" : "brightness(0.7)",
                rotateY: active === 1 ? 0 : 5,
                originX: 0,
              }}
              transition={SPRING}
              style={{ perspective: 1000 }}
            >
              <div className="absolute -left-12 top-[180px] hidden lg:flex">
                <div
                  className={`border border-r-0 border-zinc-200 dark:border-zinc-800 rounded-l-xl py-8 w-12 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.1)] transition-colors duration-300 flex items-center justify-center ${
                    active === 1
                      ? "bg-white dark:bg-[#111] z-20"
                      : "bg-zinc-100 dark:bg-zinc-800 cursor-pointer z-0"
                  }`}
                >
                  <span
                    className={`font-bold text-sm -rotate-90 whitespace-nowrap tracking-widest ${
                      active === 1
                        ? "text-zinc-900 dark:text-white"
                        : "text-zinc-500"
                    }`}
                  >
                    {config.tabs.others}
                  </span>
                </div>
              </div>
              <OtherCard card={othersFront} dimmed={active !== 1} />
            </motion.div>

            {/* The second "others" card, fanned out on wide screens. */}
            <motion.div
              onClick={() => setActive(1)}
              className="absolute top-0 bottom-0 cursor-pointer outline-none items-stretch hidden md:flex"
              animate={{
                zIndex: active === 1 ? 19 : 9,
                left: "0%",
                x: active === 1 ? "105%" : "10%",
                scale: active === 1 ? 1 : 0.9,
                opacity: active === 1 ? 1 : 0,
                filter: active === 1 ? "brightness(0.9)" : "brightness(0.7)",
                rotateY: active === 1 ? 0 : 5,
                originX: 0,
              }}
              transition={SPRING}
              style={{ perspective: 1000 }}
            >
              <OtherCard card={othersBehind} dimmed={active !== 1} muted />
            </motion.div>

            {/* The platform card. */}
            <motion.div
              onClick={() => setActive(0)}
              className="absolute top-0 bottom-0 cursor-pointer outline-none flex items-stretch"
              animate={{
                zIndex: active === 0 ? 20 : 10,
                left: "0%",
                x: active === 0 ? "0%" : "-15%",
                scale: active === 0 ? 1 : 0.95,
                opacity: active === 0 ? 1 : 0.6,
                filter: active === 0 ? "brightness(1)" : "brightness(0.7)",
                rotateY: active === 0 ? 0 : -5,
                originX: 1,
              }}
              transition={SPRING}
              style={{ perspective: 1000 }}
            >
              <div className="absolute -left-12 top-16 hidden lg:flex">
                <div
                  className={`border border-r-0 border-zinc-800 dark:border-zinc-200 rounded-l-xl py-8 w-12 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.3)] transition-colors duration-300 flex items-center justify-center ${
                    active === 0
                      ? "bg-zinc-900 dark:bg-white z-20"
                      : "bg-zinc-800 dark:bg-zinc-100 cursor-pointer z-0"
                  }`}
                >
                  <span
                    className={`font-bold text-sm -rotate-90 whitespace-nowrap tracking-widest ${
                      active === 0
                        ? "text-white dark:text-zinc-900"
                        : "text-zinc-400 dark:text-zinc-600"
                    }`}
                  >
                    {config.tabs.platform}
                  </span>
                </div>
              </div>
              <div className="w-[280px] md:w-[340px] flex flex-col rounded-[2rem] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 p-6 md:p-8 md:px-12 relative overflow-hidden shadow-2xl border border-zinc-800 dark:border-zinc-200 h-full hover:border-zinc-700 dark:hover:border-zinc-300 transition-colors duration-300 z-10">
                <AnimatePresence>
                  {active !== 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/40 dark:bg-white/40 z-50 rounded-[2rem] pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/30 dark:bg-indigo-400/20 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/30 dark:bg-purple-400/20 blur-[80px] rounded-full pointer-events-none" />

                <div className="relative z-40 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-8 w-8 rounded-full border-2 border-zinc-900 dark:border-white overflow-hidden bg-white flex items-center justify-center">
                      <Image
                        unoptimized
                        referrerPolicy="no-referrer"
                        src={platform.icon.src}
                        alt={platform.icon.alt}
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </div>
                    <span className="text-lg font-bold">{PLATFORM_NAME}</span>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl md:text-6xl font-black">
                        {platform.price}
                      </span>
                    </div>
                    <p className="text-white/80 dark:text-black/70 text-sm mt-1.5 font-medium leading-tight">
                      <Period lines={platform.period} />
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 mb-10">
                    {platform.ctas.map((cta, i) => (
                      <Link
                        key={cta.label}
                        href={cta.href}
                        target={cta.external ? "_blank" : undefined}
                        rel={cta.external ? "noopener noreferrer" : undefined}
                        className={
                          i === 0
                            ? "flex-1 flex items-center justify-center px-4 py-2.5 bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white rounded-full font-bold text-sm hover:scale-[1.02] transition-transform duration-200"
                            : "flex-1 flex items-center justify-center px-4 py-2.5 bg-transparent border border-white/20 dark:border-black/20 text-white dark:text-zinc-900 rounded-full font-bold text-sm hover:bg-white/5 dark:hover:bg-black/5 transition-colors duration-200"
                        }
                      >
                        {cta.label}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-auto space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/60 dark:text-black/50">
                      {platform.listHeading}
                    </h4>
                    <div className="space-y-3">
                      {platform.benefits.map((benefit) => (
                        <div key={benefit} className="flex items-start gap-3">
                          <div className="mt-0.5 h-5 w-5 rounded-full bg-white/10 dark:bg-black/5 flex items-center justify-center shrink-0">
                            <Check
                              className="w-3 h-3 text-emerald-400 dark:text-emerald-600 font-bold"
                              strokeWidth={3}
                            />
                          </div>
                          <span className="font-semibold text-base">
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
