"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

export function SocialSection({ id }: { id?: string }) {
  return (
    <section id={id} className="container flex w-full flex-col gap-12 py-24 bg-white dark:bg-black mx-auto">
      <div className="flex w-full max-w-7xl flex-col justify-between gap-8 px-4 md:flex-row md:items-end xl:px-0 mx-auto">
        <div className="flex flex-col gap-4">
          <p className="font-semibold text-[#4F46E5]">Merlin Chrome Extension</p>
          <h2 className="text-[32px] font-black leading-[1.2] text-zinc-900 dark:text-white md:text-[56px] md:leading-[1.1] max-w-2xl">
            Stay social, not drained
          </h2>
          <p className="text-xl font-medium text-zinc-500 dark:text-zinc-400 max-w-xl">
            With Merlin's Chrome Extension, be digitally present effortlessly. Engage, reach out and express better with the world.
          </p>
        </div>
        <Link
          href="https://chromewebstore.google.com/detail/merlin-1-click-access-to/camppjleccjaphfdbohjdohecfnoikec"
          target="_blank"
          className="flex h-fit w-fit items-center justify-center gap-2 rounded-full bg-[#4F46E5] px-6 py-3 text-base font-bold text-white transition-transform hover:scale-105"
        >
          Start creating for free!
        </Link>
      </div>

      <div className="flex w-full flex-col gap-6 md:gap-8 mx-auto max-w-7xl px-4 xl:px-0">
        <div className="flex w-full flex-col gap-6 md:flex-row md:gap-8">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative flex w-full flex-col justify-between overflow-hidden rounded-[24px] bg-[#F3F4F6] dark:bg-zinc-900 md:w-3/5 p-8 md:p-12 min-h-[400px]"
          >
             <div className="relative mb-8 h-[200px] w-full md:h-[250px]">
              <Image
                src="https://cdn.getmerlin.in/cms/gmail_ecea349519.webp"
                alt="Write mails effortlessly"
                fill
                className="object-contain object-left-bottom transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
            <div className="flex flex-col gap-4 z-10 max-w-md">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-[32px] leading-tight">
                Write mails effortlessly
              </h3>
              <p className="text-lg text-zinc-500 dark:text-zinc-400">
                Compose mails with AI and generate replies in the context of the previous mail.
              </p>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group relative flex w-full flex-col justify-between overflow-hidden rounded-[24px] bg-[#EFF6FF] dark:bg-blue-950/20 md:w-2/5 p-8 md:p-12 min-h-[400px]"
          >
            <div className="relative mb-8 h-[200px] w-full md:h-[250px]">
               <Image
                src="https://cdn.getmerlin.in/cms/social_media_a521fbf4cc.webp"
                alt="Draft posts"
                fill
                className="object-contain object-center transition-transform duration-500 group-hover:scale-[1.05]"
              />
            </div>
            <div className="flex flex-col gap-4 z-10">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-[32px] leading-tight">
                Draft posts and replies on social media
              </h3>
              <p className="text-lg text-zinc-500 dark:text-zinc-400">
                Generate with prompts and save them for repeated use. Engagement on top.
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
            className="group relative flex w-full flex-col justify-between overflow-hidden rounded-[24px] bg-[#FEF2F2] dark:bg-red-950/20 md:w-2/5 p-8 md:p-12 min-h-[400px]"
          >
            <div className="relative mb-8 h-[200px] w-full md:h-[250px]">
               <Image
                src="https://cdn.getmerlin.in/cms/content_from_vid_336ec65ad8.webp"
                alt="Create content from videos"
                fill
                className="object-contain object-center transition-transform duration-500 group-hover:scale-[1.05]"
              />
            </div>
             <div className="flex flex-col gap-4 z-10">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-[32px] leading-tight">
                Create content from videos
              </h3>
              <p className="text-lg text-zinc-500 dark:text-zinc-400">
                Blogs, X posts, articles - you name it, from any YouTube video.
              </p>
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group relative flex w-full flex-col justify-between overflow-hidden rounded-[24px] bg-[#FAF5FF] dark:bg-fuchsia-950/20 md:w-3/5 p-8 md:p-12 min-h-[400px]"
          >
            <div className="relative mb-8 h-[200px] w-full md:h-[250px] flex justify-end">
               <Image
                src="https://cdn.getmerlin.in/cms/image_gen_21ee18a2ef.webp"
                alt="Get the perfect poster image"
                fill
                className="object-contain object-right-bottom transition-transform duration-500 group-hover:scale-[1.05]"
              />
            </div>
             <div className="flex flex-col gap-4 z-10 max-w-md">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white md:text-[32px] leading-tight">
                Get the perfect poster image
              </h3>
              <p className="text-lg text-zinc-500 dark:text-zinc-400">
                Generate images with 20+ image models and aspect ratios for web and social media.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
