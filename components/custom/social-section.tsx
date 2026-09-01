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

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

import { PLATFORM_NAME } from "@/app/config/platform";

export function SocialSection({ id }: { id?: string }) {
  return (
    <section
      id={id}
      className="container flex w-full flex-col gap-12 py-16 mx-auto bg-white dark:bg-black"
    >
      <div className="flex w-full flex-col items-center justify-center gap-6 px-4 text-center max-w-4xl mx-auto">
        <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-900 px-3 py-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {PLATFORM_NAME} Chrome Extension
        </span>
        <h2 className="text-[32px] font-black leading-[1.2] text-zinc-900 dark:text-white md:text-[64px] md:leading-[1.1] tracking-tighter">
          Stay social, not drained
        </h2>
        <p className="text-xl font-medium text-zinc-500 dark:text-zinc-400 max-w-3xl leading-relaxed">
          With {PLATFORM_NAME}'s Chrome Extension, be digitally present
          effortlessly. Engage, reach out and express better with the world.
        </p>
        <Link
          href="https://chromewebstore.google.com/detail/merlin-1-click-access-to/camppjleccjaphfdbohjdohecfnoikec"
          target="_blank"
          className="flex h-fit w-fit items-center justify-center gap-2 rounded-full bg-[#4F46E5] px-6 py-3 text-base font-bold text-white transition-transform hover:scale-105 mt-4"
        >
          Start creating for free!
        </Link>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 xl:px-0 mt-8 relative flex items-center justify-center">
        <Carousel
          opts={{
            align: "start",
            loop: false,
            dragFree: true,
          }}
          className="w-full relative"
        >
          <CarouselContent className="-ml-4 !-ml-0">
            <CarouselItem className="min-w-0 shrink-0 grow-0 basis-full flex justify-center p-0 md:basis-1/2 lg:basis-[28%] pl-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.0 }}
                className="flex flex-col overflow-hidden group w-full"
              >
                <div className="relative h-64 w-full shrink-0 overflow-hidden rounded-[24px] bg-zinc-100 dark:bg-zinc-900">
                  <Image
                    unoptimized
                    referrerPolicy="no-referrer"
                    src="https://cdn.getmerlin.in/cms/gmail_ecea349519.webp"
                    alt="Write mails effortlessly"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-3 pt-6 px-2">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Write mails effortlessly
                  </h3>
                  <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Compose mails with AI and generate replies in the context of
                    the previous mail.
                  </p>
                </div>
              </motion.div>
            </CarouselItem>

            <CarouselItem className="min-w-0 shrink-0 grow-0 basis-full flex justify-center p-0 md:basis-1/2 lg:basis-[28%] pl-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex flex-col overflow-hidden group w-full"
              >
                <div className="relative h-64 w-full shrink-0 overflow-hidden rounded-[24px] bg-zinc-100 dark:bg-zinc-900">
                  <Image
                    unoptimized
                    referrerPolicy="no-referrer"
                    src="https://cdn.getmerlin.in/cms/social_media_a521fbf4cc.webp"
                    alt="Draft posts and replies on social media"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-3 pt-6 px-2">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Draft posts and replies on social media
                  </h3>
                  <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Generate with prompts and save them for repeated use.
                    Engagement on top.
                  </p>
                </div>
              </motion.div>
            </CarouselItem>

            <CarouselItem className="min-w-0 shrink-0 grow-0 basis-full flex justify-center p-0 md:basis-1/2 lg:basis-[28%] pl-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col overflow-hidden group w-full"
              >
                <div className="relative h-64 w-full shrink-0 overflow-hidden rounded-[24px] bg-zinc-100 dark:bg-zinc-900">
                  <Image
                    unoptimized
                    referrerPolicy="no-referrer"
                    src="https://cdn.getmerlin.in/cms/content_from_vid_336ec65ad8.webp"
                    alt="Create content from videos"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-3 pt-6 px-2">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Create content from videos
                  </h3>
                  <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Blogs, X posts, articles - you name it, from any YouTube
                    video.
                  </p>
                </div>
              </motion.div>
            </CarouselItem>

            <CarouselItem className="min-w-0 shrink-0 grow-0 basis-full flex justify-center p-0 md:basis-1/2 lg:basis-[28%] pl-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.30000000000000004 }}
                className="flex flex-col overflow-hidden group w-full"
              >
                <div className="relative h-64 w-full shrink-0 overflow-hidden rounded-[24px] bg-zinc-100 dark:bg-zinc-900">
                  <Image
                    unoptimized
                    referrerPolicy="no-referrer"
                    src="https://cdn.getmerlin.in/cms/image_gen_21ee18a2ef.webp"
                    alt="Get the perfect poster image"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-3 pt-6 px-2">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    Get the perfect poster image
                  </h3>
                  <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Generate images with 20+ image models and aspect ratios for
                    web and social media.
                  </p>
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
