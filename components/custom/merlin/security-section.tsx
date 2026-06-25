"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export function SecuritySection({ id }: { id?: string }) {
  return (
    <section id={id} className="container flex w-full flex-col gap-12 py-24 bg-white dark:bg-black mx-auto items-center">
      <div className="flex w-full max-w-5xl flex-col items-center gap-6 px-4 xl:px-0 text-center">
        <h2 className="text-[32px] font-black leading-[1.2] text-zinc-900 dark:text-white md:text-[56px] md:leading-[1.1]">
          Secure and customizable
        </h2>
        <p className="text-xl font-medium text-zinc-500 dark:text-zinc-400 max-w-2xl">
          Build custom solutions that adapt to your context, knowledge or brand voice, with industry-leading security.
        </p>
      </div>

      <div className="flex w-full flex-col gap-6 md:gap-8 mx-auto max-w-7xl px-4 xl:px-0">
        <div className="flex w-full flex-col gap-6 md:flex-row md:gap-8">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative flex w-full flex-col justify-between overflow-hidden rounded-[24px] bg-zinc-50 dark:bg-zinc-900 md:w-1/2 p-8 md:p-12"
          >
             <div className="flex flex-col gap-4 z-10 max-w-md">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-[32px] leading-tight">
                Industry-grade data security
              </h3>
              <p className="text-lg text-zinc-500 dark:text-zinc-400">
                GDPR, ISO 27001, AICPA SOC 2 certification for industry-standard data security.
              </p>
            </div>
            <div className="relative mt-8 h-[250px] w-full">
               <Image
                 unoptimized
                 referrerPolicy="no-referrer"
                 src="https://cdn.getmerlin.in/cms/Frame_1321318025_5_0a00fc2b21.png"
                 alt="Data security"
                 fill
                 className="object-contain object-bottom transition-transform duration-500 group-hover:scale-[1.02]"
               />
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group relative flex w-full flex-col justify-between overflow-hidden rounded-[24px] bg-zinc-50 dark:bg-zinc-900 md:w-1/2 p-8 md:p-12"
          >
             <div className="flex flex-col gap-4 z-10 max-w-md">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-[32px] leading-tight">
                Make your own prompt library
              </h3>
              <p className="text-lg text-zinc-500 dark:text-zinc-400">
                Automate generation of text, comments and posts with one click.
              </p>
            </div>
            <div className="relative mt-8 h-[250px] w-full">
               <Image
                 unoptimized
                 referrerPolicy="no-referrer"
                 src="https://cdn.getmerlin.in/cms/Frame_1321318025_8_db66981d2c.png"
                 alt="Prompt library"
                 fill
                 className="object-contain object-bottom transition-transform duration-500 group-hover:scale-[1.02]"
               />
            </div>
          </motion.div>
        </div>

        {/* Full width card */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative flex w-full flex-col justify-between overflow-hidden rounded-[24px] bg-zinc-50 dark:bg-zinc-900 p-8 md:p-12 md:flex-row items-center"
        >
             <div className="flex flex-col gap-4 z-10 md:w-1/2">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-[32px] leading-tight">
                Create custom bots
              </h3>
              <p className="text-lg text-zinc-500 dark:text-zinc-400">
                String instructions, context and knowledge together to create custom chatbots.
              </p>
            </div>
            <div className="relative mt-8 md:mt-0 h-[250px] md:h-[300px] w-full md:w-1/2">
              <Image
                src="https://cdn.getmerlin.in/cms/Frame_1321318025_1_81fb6cae7e.png"
                alt="Custom bots"
                fill
                className="object-contain object-right-bottom transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
        </motion.div>
      </div>
    </section>
  );
}
