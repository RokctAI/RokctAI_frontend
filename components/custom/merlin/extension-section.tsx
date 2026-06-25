"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { PLATFORM_NAME } from "@/app/config/platform";

export function ExtensionSection({ id }: { id?: string }) {
  return (
    <section id={id} className="container flex w-full flex-col gap-16 py-12 md:py-20 bg-white dark:bg-black">
      <div className="flex w-full max-w-7xl flex-col justify-between gap-12 px-4 md:flex-row md:items-end xl:px-0 mx-auto">
        <div className="flex flex-col gap-4">
          <p className="font-semibold text-[#4F46E5]">{PLATFORM_NAME} Chrome Extension</p>
          <h2 className="text-[32px] font-black leading-[1.2] text-zinc-900 dark:text-white md:text-[56px] md:leading-[1.1] max-w-2xl">
            One-click answers in realtime
          </h2>
          <p className="text-xl font-medium text-zinc-500 dark:text-zinc-400 max-w-xl">
            Get context from wherever you are, and just ask with one click.
          </p>
        </div>
        <Link
          href="https://chromewebstore.google.com/detail/merlin-1-click-access-to/camppjleccjaphfdbohjdohecfnoikec"
          target="_blank"
          className="flex h-fit w-fit items-center justify-center gap-2 rounded-full bg-[#4F46E5] px-6 py-3 text-base font-bold text-white transition-transform hover:scale-105"
        >
          Get the extension
        </Link>
      </div>

      <div className="flex w-full flex-col gap-6 md:gap-8 mx-auto max-w-7xl px-4 xl:px-0">
        <div className="flex w-full flex-col gap-6 md:flex-row md:gap-8">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative flex w-full flex-col justify-between overflow-hidden rounded-[24px] bg-zinc-50 dark:bg-zinc-900 md:w-3/5 p-8 md:p-12"
          >
            <div className="flex flex-col gap-4 z-10 max-w-md">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-[32px] leading-tight">
                Don't switch tabs. Just ask
              </h3>
              <p className="text-lg text-zinc-500 dark:text-zinc-400">
                Summarize, search, repurpose and create content out of any website you visit.
              </p>
            </div>
            <div className="relative mt-8 h-[200px] w-full md:h-[300px]">
                <Image
                  unoptimized
                  referrerPolicy="no-referrer"
                  src="https://cdn.getmerlin.in/cms/Webpage_b52be8433e.webp"
                  alt="Don't switch tabs"
                  fill
                  className="object-cover object-left-top rounded-tl-xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                />
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group relative flex w-full flex-col justify-between overflow-hidden rounded-[24px] bg-[#E0E7FF] dark:bg-indigo-950/30 md:w-2/5 p-8 md:p-12"
          >
            <div className="flex flex-col gap-4 z-10">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-[32px] leading-tight">
                Search better and get answers at a glance.
              </h3>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                Avoid spending time going through each search result on Google. Instead, get a summary and ask for specific details.
              </p>
            </div>
            <div className="relative mt-8 h-[200px] w-full md:h-[250px]">
               <Image
                 unoptimized
                 referrerPolicy="no-referrer"
                 src="https://cdn.getmerlin.in/cms/image_5_a028a37070.webp"
                 alt="Search better"
                 fill
                 className="object-contain object-bottom transition-transform duration-500 group-hover:scale-[1.05]"
               />
            </div>
          </motion.div>
        </div>

        <div className="flex w-full flex-col gap-6 md:flex-row md:gap-8">
          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative flex w-full flex-col justify-between overflow-hidden rounded-[24px] bg-[#FEF3C7] dark:bg-amber-950/20 md:w-2/5 p-8 md:p-12"
          >
             <div className="flex flex-col gap-4 z-10">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-[32px] leading-tight">
                Add context with...anything
              </h3>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                Writing a contract or making a quiz? Just upload guidebooks or lecture PDFs, let {PLATFORM_NAME} learn from them and respond.
              </p>
            </div>
            <div className="relative mt-8 h-[200px] w-full md:h-[250px]">
               <Image
                 unoptimized
                 referrerPolicy="no-referrer"
                 src="https://cdn.getmerlin.in/cms/image_7_f6eefa4244.webp"
                 alt="Add context"
                 fill
                 className="object-contain object-bottom transition-transform duration-500 group-hover:scale-[1.05]"
               />
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group relative flex w-full flex-col justify-between overflow-hidden rounded-[24px] bg-[#FCE7F3] dark:bg-pink-950/20 md:w-3/5 p-8 md:p-12"
          >
             <div className="flex flex-col gap-4 z-10 max-w-md">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-[32px] leading-tight">
                Learn smart, not in a rush
              </h3>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                Spend time actively learning using video summaries and chat with the video, instead of rushing videos on 2x.
              </p>
            </div>
            <div className="relative mt-8 h-[200px] w-full md:h-[250px] flex justify-end">
               <Image
                 unoptimized
                 referrerPolicy="no-referrer"
                 src="https://cdn.getmerlin.in/cms/image_8_eb258bba3b.webp"
                 alt="Learn smart"
                 fill
                 className="object-contain object-right-bottom transition-transform duration-500 group-hover:scale-[1.05]"
               />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
