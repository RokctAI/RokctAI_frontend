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

// The landing page's FAQ accordion. Copy and questions: AGENT_LANDING_CONFIG.faq.

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

import { AGENT_LANDING_CONFIG } from "@/components/custom/landing/agent-landing-config";
import type { PageSectionMeta } from "@/components/custom/landing/page-sections";

export function FaqSection({ id }: { id?: string }) {
  const config = AGENT_LANDING_CONFIG.faq;
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  if (!config) return null;

  const toggle = (index: number) =>
    setOpenIndex(openIndex === index ? null : index);

  return (
    <section
      id={id}
      className="container flex w-full flex-col gap-12 py-12 md:py-20 bg-white dark:bg-black mx-auto"
    >
      <div className="flex w-full flex-col items-center justify-center gap-6 px-4 text-center">
        <h2 className="text-[32px] font-black leading-[1.2] text-zinc-900 dark:text-white md:text-[56px] md:leading-[1.1]">
          {config.heading}
        </h2>
        <p className="text-xl font-medium text-zinc-500 dark:text-zinc-400 max-w-2xl">
          {config.blurb}
        </p>
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 xl:px-0 mt-8">
        <div className="flex flex-col gap-4">
          {config.items.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div
                key={faq.question}
                className={`border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden transition-all duration-300 ${
                  open ? "bg-zinc-50 dark:bg-zinc-900" : "bg-transparent"
                }`}
              >
                <button
                  onClick={() => toggle(index)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between p-3 md:p-5 text-left"
                >
                  <span className="text-base md:text-xl font-bold text-zinc-900 dark:text-white pr-8">
                    {faq.question}
                  </span>
                  <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 md:w-10 md:h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                    {open ? (
                      <Minus className="w-3 h-3 md:w-5 md:h-5" />
                    ) : (
                      <Plus className="w-3 h-3 md:w-5 md:h-5" />
                    )}
                  </span>
                </button>

                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-200 dark:border-zinc-800/50 mt-2">
                        <p className="pt-4">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
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
  order: 80,
  nav: [{ id: "faq", label: "FAQ" }],
};

export default FaqSection;
