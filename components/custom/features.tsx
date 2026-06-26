"use client";

import { PLATFORM_NAME } from "@/app/config/platform";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const features = [
  {
    title: "One-click answers in realtime",
    description: "Get context from wherever you are, and just ask with one click.",
    image: "https://cdn.getmerlin.in/cms/Webpage_b52be8433e.webp",
    tag: `${PLATFORM_NAME} Chrome Extension`,
    span: "md:col-span-2",
  },
  {
    title: "Don't switch tabs. Just ask",
    description: "Summarize, search, repurpose and create content out of any website you visit.",
    image: "https://cdn.getmerlin.in/cms/image_5_a028a37070.webp",
    tag: "Efficiency",
    span: "md:col-span-1",
  },
  {
    title: "Search better and get answers at a glance",
    description: "Avoid spending time going through each search result on Google. Instead, get a summary and ask for specific details.",
    image: "https://cdn.getmerlin.in/cms/image_5_a028a37070.webp",
    tag: "Search better",
    span: "md:col-span-1",
  },
  {
    title: "Add context with...anything",
    description: `Writing a contract or making a quiz? Just upload guidebooks or lecture PDFs, let ${PLATFORM_NAME} learn from them and respond.`,
    image: "https://cdn.getmerlin.in/cms/image_7_f6eefa4244.webp",
    tag: "Knowledge Base",
    span: "md:col-span-1",
  },
  {
    title: "Learn smart, not in a rush",
    description: "Spend time actively learning using video summaries and chat with the video, instead of rushing videos on 2x.",
    image: "https://cdn.getmerlin.in/cms/image_8_eb258bba3b.webp",
    tag: "Learning",
    span: "md:col-span-2",
  },
];

export function Features({ id }: { id?: string }) {
  return (
    <section id={id} className="relative py-24 bg-white dark:bg-black overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05] [background-image:linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] [background-size:40px_40px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative flex flex-col p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-300 ${feature.span}`}
            >
              <div className="flex flex-col h-full">
                <span className="inline-block w-fit px-3 py-1 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-xs font-bold tracking-wide mb-4 shadow-sm">
                  {feature.tag}
                </span>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight mb-3">
                  {feature.title}
                </h2>
                <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">
                  {feature.description}
                </p>
                <div className="mt-auto relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg bg-white dark:bg-black">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={800}
                    height={600}
                    className="w-full h-auto transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


