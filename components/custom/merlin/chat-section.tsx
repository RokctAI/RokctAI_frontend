"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

export function ChatSection({ id }: { id?: string }) {
  return (
    <section id={id} className="container flex w-full flex-col gap-12 py-24 bg-white dark:bg-black mx-auto">
      <div className="flex w-full max-w-7xl flex-col justify-between gap-8 px-4 md:flex-row md:items-end xl:px-0 mx-auto">
        <div className="flex flex-col gap-4">
          <p className="font-semibold text-[#4F46E5]">NEW · Merlin Chat</p>
          <h2 className="text-[32px] font-black leading-[1.2] text-zinc-900 dark:text-white md:text-[56px] md:leading-[1.1] max-w-2xl">
            For those who build
          </h2>
          <p className="text-xl font-medium text-zinc-500 dark:text-zinc-400 max-w-xl">
            Research with realtime info, visualise insights and build products with words.
          </p>
        </div>
        <Link
          href="/chat"
          className="flex h-fit w-fit items-center justify-center gap-2 rounded-full bg-zinc-900 dark:bg-white px-6 py-3 text-base font-bold text-white dark:text-black transition-transform hover:scale-105"
        >
          Explore now
        </Link>
      </div>

      <div className="flex w-full flex-col gap-6 md:gap-8 mx-auto max-w-7xl px-4 xl:px-0">
        <div className="flex w-full flex-col gap-6 md:flex-row md:gap-8">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative flex w-full flex-col justify-between overflow-hidden rounded-[24px] bg-zinc-50 dark:bg-zinc-900 md:w-3/5 p-8 md:p-12 min-h-[400px]"
          >
             <div className="relative mb-8 h-[200px] w-full md:h-[250px]">
              <Image
                src="https://cdn.getmerlin.in/cms/projects_33be20ddec.webp"
                alt="Projects"
                fill
                className="object-contain object-left-bottom transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
            <div className="flex flex-col gap-4 z-10 max-w-md">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-[32px] leading-tight">
                Use your own knowledge to research
              </h3>
              <p className="text-lg text-zinc-500 dark:text-zinc-400">
                With Projects, add any context, create reusable knowledge bases and query repeatedly for tailored responses.
              </p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group relative flex w-full flex-col justify-between overflow-hidden rounded-[24px] bg-zinc-50 dark:bg-zinc-900 md:w-2/5 p-8 md:p-12 min-h-[400px]"
          >
            <div className="relative mb-8 h-[200px] w-full md:h-[250px]">
               <Image
                src="https://cdn.getmerlin.in/cms/infog_a09cbff947.webp"
                alt="Infographics"
                fill
                className="object-contain object-center transition-transform duration-500 group-hover:scale-[1.05]"
              />
            </div>
            <div className="flex flex-col gap-4 z-10">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-[32px] leading-tight">
                Turn words into infographics
              </h3>
              <p className="text-lg text-zinc-500 dark:text-zinc-400">
                With Crafts, generate a variety of diagrams and interactive charts with just a prompt.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="flex w-full flex-col gap-6 md:flex-row md:gap-8">
          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative flex w-full flex-col justify-between overflow-hidden rounded-[24px] bg-zinc-50 dark:bg-zinc-900 md:w-2/5 p-8 md:p-12 min-h-[400px]"
          >
            <div className="relative mb-8 h-[200px] w-full md:h-[250px]">
               <Image
                src="https://cdn.getmerlin.in/cms/appsnip_0edfd396f9.webp"
                alt="App snippets"
                fill
                className="object-contain object-center transition-transform duration-500 group-hover:scale-[1.05]"
              />
            </div>
             <div className="flex flex-col gap-4 z-10">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-[32px] leading-tight">
                Create working app snippets
              </h3>
              <p className="text-lg text-zinc-500 dark:text-zinc-400">
                Prototype rapidly with React and Shadcn based app snippets and edit code on the fly.
              </p>
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group relative flex w-full flex-col justify-between overflow-hidden rounded-[24px] bg-zinc-50 dark:bg-zinc-900 md:w-3/5 p-8 md:p-12 min-h-[400px]"
          >
            <div className="relative mb-8 h-[200px] w-full md:h-[250px] flex justify-end">
               <Image
                src="https://cdn.getmerlin.in/cms/o1_cfad888c7c.webp"
                alt="o1 model"
                fill
                className="object-contain object-right-bottom transition-transform duration-500 group-hover:scale-[1.05]"
              />
            </div>
             <div className="flex flex-col gap-4 z-10 max-w-md">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-[32px] leading-tight">
                Use OpenAI o1 with realtime web
              </h3>
              <p className="text-lg text-zinc-500 dark:text-zinc-400">
                Use chain-of-thought reasoning with realtime web sources to get a powerful research machine in your hands
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
