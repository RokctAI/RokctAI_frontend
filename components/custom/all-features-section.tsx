"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const FEATURES_LIST = [
  {
    title: "Brand voice content with custom knowledge bases",
    image: "https://cdn.getmerlin.in/cms/brand_voice_hover_image_1_9441c286c4.webp"
  },
  {
    title: "Working app snippets, web code and components",
    image: "https://cdn.getmerlin.in/cms/code_snippets_ad5dd9c340.png"
  },
  {
    title: "Flowcharts, mindmaps and 20+ infographic types",
    image: "https://cdn.getmerlin.in/cms/diagrams_405f737d5d.webp"
  },
  {
    title: "Generate images with Flux 1.1 Pro",
    image: "https://cdn.getmerlin.in/cms/Generate_AI_images_and_art_Bonkers_8edfa01b5b.webp"
  },
  {
    title: "Convert YouTube videos into posts and blogs",
    image: "https://cdn.getmerlin.in/cms/Youtube_Summariser_2161a48f6d.webp"
  },
  {
    title: "Posts and comments on X and LinkedIn",
    image: "https://cdn.getmerlin.in/cms/Twitter_commenter_9b7d00b268.webp"
  },
  {
    title: "Solve STEM problems and puzzles with OpenAI o1",
    image: "https://cdn.getmerlin.in/cms/o1_1_f3cabdfcec.webp"
  },
  {
    title: "AI tools for academic, marketing and tech research",
    image: "https://cdn.getmerlin.in/cms/Chat_with_20_top_AI_models_GPT_4_Claude_3_etc_3b2e6b7e57.webp"
  },
  {
    title: "One-click blog summaries",
    image: "https://cdn.getmerlin.in/cms/Blog_Summariser_91f8e612ef.webp"
  },
  {
    title: "Summarize and transcribe YouTube videos",
    image: "https://cdn.getmerlin.in/cms/Youtube_Transcription_tool_3d92b8ee68.webp"
  }
];

export function AllFeaturesSection({ id }: { id?: string }) {
  return (
    <section id={id} className="container flex w-full flex-col gap-12 py-24 bg-white dark:bg-black mx-auto">
      <div className="flex w-full flex-col items-center justify-center gap-6 px-4 text-center">
         <h2 className="text-[32px] font-black leading-[1.2] text-zinc-900 dark:text-white md:text-[56px] md:leading-[1.1]">
            All that... and more
         </h2>
         <p className="text-xl font-medium text-zinc-500 dark:text-zinc-400 max-w-2xl">
            Here’s everything Merlin has to offer. P.S. This list grows on every week!
         </p>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 xl:px-0 mt-8">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES_LIST.map((feature, index) => (
               <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative flex h-[200px] w-full flex-col justify-end overflow-hidden rounded-3xl bg-zinc-100 dark:bg-zinc-900 shadow-sm transition-all hover:shadow-lg"
               >
                  <div className="absolute inset-0 z-0">
                      <Image
                         unoptimized
                         referrerPolicy="no-referrer"
                         src={feature.image}
                         alt={feature.title}
                         fill
                         className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  </div>
                  <div className="relative z-10 flex w-full items-end justify-between p-6">
                     <h3 className="text-lg font-bold text-white max-w-[85%] leading-tight group-hover:text-white/90">
                        {feature.title}
                     </h3>
                     <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>
      </div>
    </section>
  );
}
