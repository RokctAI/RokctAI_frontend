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

// The landing page's "social" carousel. Copy and cards: AGENT_LANDING_CONFIG.social.

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AGENT_LANDING_CONFIG } from "@/components/custom/landing/agent-landing-config";
import type { PageSectionMeta } from "@/components/custom/landing/page-sections";

export function SocialSection({ id }: { id?: string }) {
  const config = AGENT_LANDING_CONFIG.social;
  if (!config) return null;

  return (
    <section
      id={id}
      className="container flex w-full flex-col gap-12 py-16 mx-auto bg-white dark:bg-black"
    >
      <div className="flex w-full flex-col items-center justify-center gap-6 px-4 text-center max-w-4xl mx-auto">
        <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-900 px-3 py-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {config.badge}
        </span>
        <h2 className="text-[32px] font-black leading-[1.2] text-zinc-900 dark:text-white md:text-[64px] md:leading-[1.1] tracking-tighter">
          {config.heading}
        </h2>
        <p className="text-xl font-medium text-zinc-500 dark:text-zinc-400 max-w-3xl leading-relaxed">
          {config.blurb}
        </p>
        <Link
          href={config.cta.href}
          target={config.cta.external ? "_blank" : undefined}
          rel={config.cta.external ? "noopener noreferrer" : undefined}
          className="flex h-fit w-fit items-center justify-center gap-2 rounded-full bg-[#4F46E5] px-6 py-3 text-base font-bold text-white transition-transform hover:scale-105 mt-4"
        >
          {config.cta.label}
        </Link>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 xl:px-0 mt-8 relative flex items-center justify-center">
        <Carousel
          opts={{ align: "start", loop: false, dragFree: true }}
          className="w-full relative"
        >
          <CarouselContent className="-ml-4 !-ml-0">
            {config.cards.map((card, index) => (
              <CarouselItem
                key={card.title}
                className="min-w-0 shrink-0 grow-0 basis-full flex justify-center p-0 md:basis-1/2 lg:basis-[28%] pl-4"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col overflow-hidden group w-full"
                >
                  <div className="relative h-64 w-full shrink-0 overflow-hidden rounded-[24px] bg-zinc-100 dark:bg-zinc-900">
                    <Image
                      unoptimized
                      referrerPolicy="no-referrer"
                      src={card.image.src}
                      alt={card.image.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col gap-3 pt-6 px-2">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                      {card.title}
                    </h3>
                    <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {card.text}
                    </p>
                  </div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 size-12 shadow hover:bg-accent hover:text-accent-foreground hidden lg:flex" />
          <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 size-12 shadow hover:bg-accent hover:text-accent-foreground hidden lg:flex" />
        </Carousel>
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
  order: 30,
  nav: [{ id: "social", label: "Social Media" }],
};

export default SocialSection;
