/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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
import { motion } from "framer-motion";
import Link from "next/link";
import { PLATFORM_NAME } from "@/app/config/platform";
import { MoveRight } from "lucide-react";
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
            <MoveRight className="ml-2 size-4" />
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
                      src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop"
                      alt="Projects"
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
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop"
                      alt="Infographics"
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
                      src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop"
                      alt="App snippets"
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
                      src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop"
                      alt="o1 model"
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
