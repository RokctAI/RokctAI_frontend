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

// The chat section's CLIENT half (since 1.18.0): the carousel and the
// framer cards, unchanged. Rendered by ./chat-section.tsx, the section's
// entry, which holds `meta` where the server can read it.
//
// 1.23.0: the four card pictures are the shell's own files under
// /landing/agent/ (installed from templates/public/landing/agent/), not
// stock photos hot-linked from Unsplash: all four are drawn in code for
// this page, in the landing config's style.

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { PLATFORM_NAME } from "@/app/config/platform";
import { RiArrowRightLine } from "@remixicon/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

export function ChatSection({ id }: { id?: string }) {
  return (
    <section
      id={id}
      className="container flex w-full flex-col gap-12 py-16 md:py-20 mx-auto relative items-center justify-center"
    >
      <div className="flex w-full flex-col items-center justify-center gap-6 px-4 xl:px-0 text-center">
        <div className="inline-flex items-center py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow hover:bg-blue-600/80 dark:border-blue-400-muted rounded-sm border border-blue-600 bg-background px-3 text-blue-600 dark:text-blue-400">
          NEW · {PLATFORM_NAME} Chat
        </div>
        <h2 className="text-foreground font-serif w-full text-center text-3xl font-medium tracking-normal md:text-5xl">
          For those who build
        </h2>
        <h4 className="font-sans font-medium text-center text-lg text-muted-foreground md:text-2xl">
          Research with realtime info, visualise insights and build products
          with words.
        </h4>
        <div className="mt-4">
          <Link
            href="/chat"
            className="flex w-max items-center rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 text-sm font-semibold shadow hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Explore now
            <RiArrowRightLine className="ml-2 size-4" />
          </Link>
        </div>
      </div>

      <div className="relative flex items-center justify-center w-full max-w-[1400px] mt-8 px-4 xl:px-0">
        <Carousel
          opts={{
            align: "center",
            loop: false,
            dragFree: true,
          }}
          className="w-full relative"
        >
          <CarouselContent className="-ml-4 !-ml-0 md:justify-center pb-6">
            {/* Card 1 */}
            <CarouselItem className="min-w-0 shrink-0 grow-0 basis-auto flex justify-center p-0 pl-4 lg:pl-6 xl:pl-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="shrink-0 w-[280px] flex justify-center p-0 group cursor-pointer"
              >
                <div className="flex w-[280px] flex-col gap-4">
                  <div className="relative h-[300px] w-full overflow-hidden rounded-lg">
                    <Image
                      unoptimized
                      src="/landing/agent/knowledge.svg"
                      alt="Files and links feeding a project that answers with citations"
                      fill
                      className="rounded-lg object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col gap-1 z-10">
                    <h4 className="text-foreground font-serif text-lg font-medium leading-[28px] sm:min-h-12">
                      Use your own knowledge to research
                    </h4>
                    <p className="font-sans text-base font-medium leading-[26px] text-muted-foreground">
                      With Projects, add any context, create reusable knowledge
                      bases and query repeatedly for tailored responses.
                    </p>
                  </div>
                </div>
              </motion.div>
            </CarouselItem>

            {/* Card 2 */}
            <CarouselItem className="min-w-0 shrink-0 grow-0 basis-auto flex justify-center p-0 pl-4 lg:pl-6 xl:pl-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="shrink-0 w-[280px] flex justify-center p-0 group cursor-pointer"
              >
                <div className="flex w-[280px] flex-col gap-4">
                  <div className="relative h-[300px] w-full overflow-hidden rounded-lg">
                    <Image
                      unoptimized
                      src="/landing/agent/diagram.svg"
                      alt="A flowchart drawn from a prompt"
                      fill
                      className="rounded-lg object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col gap-1 z-10">
                    <h4 className="text-foreground font-serif text-lg font-medium leading-[28px] sm:min-h-12">
                      Turn words into infographics
                    </h4>
                    <p className="font-sans text-base font-medium leading-[26px] text-muted-foreground">
                      With Crafts, generate a variety of diagrams and
                      interactive charts with just a prompt.
                    </p>
                  </div>
                </div>
              </motion.div>
            </CarouselItem>

            {/* Card 3 */}
            <CarouselItem className="min-w-0 shrink-0 grow-0 basis-auto flex justify-center p-0 pl-4 lg:pl-6 xl:pl-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="shrink-0 w-[280px] flex justify-center p-0 group cursor-pointer"
              >
                <div className="flex w-[280px] flex-col gap-4">
                  <div className="relative h-[300px] w-full overflow-hidden rounded-lg">
                    <Image
                      unoptimized
                      src="/landing/agent/code.svg"
                      alt="A React component's code beside its live preview"
                      fill
                      className="rounded-lg object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col gap-1 z-10">
                    <h4 className="text-foreground font-serif text-lg font-medium leading-[28px] sm:min-h-12">
                      Create working app snippets
                    </h4>
                    <p className="font-sans text-base font-medium leading-[26px] text-muted-foreground">
                      Prototype rapidly with React and Shadcn based app snippets
                      and edit code on the fly.
                    </p>
                  </div>
                </div>
              </motion.div>
            </CarouselItem>

            {/* Card 4 */}
            <CarouselItem className="min-w-0 shrink-0 grow-0 basis-auto flex justify-center p-0 pl-4 lg:pl-6 xl:pl-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="shrink-0 w-[280px] flex justify-center p-0 group cursor-pointer"
              >
                <div className="flex w-[280px] flex-col gap-4">
                  <div className="relative h-[300px] w-full overflow-hidden rounded-lg">
                    <Image
                      unoptimized
                      src="/landing/agent/reasoning.svg"
                      alt="Step-by-step reasoning checked against live web sources"
                      fill
                      className="rounded-lg object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col gap-1 z-10">
                    <h4 className="text-foreground font-serif text-lg font-medium leading-[28px] sm:min-h-12">
                      Use OpenAI o1 with realtime web
                    </h4>
                    <p className="font-sans text-base font-medium leading-[26px] text-muted-foreground">
                      Use chain-of-thought reasoning with realtime web sources
                      to get a powerful research machine in your hands
                    </p>
                  </div>
                </div>
              </motion.div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 size-12 shadow hover:bg-accent hover:text-accent-foreground hidden lg:flex" />
          <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 size-12 shadow hover:bg-accent hover:text-accent-foreground hidden lg:flex" />
        </Carousel>
      </div>
    </section>
  );
}
