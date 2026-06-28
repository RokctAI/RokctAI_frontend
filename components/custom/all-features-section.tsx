"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { PLATFORM_NAME } from "@/app/config/platform";

export function AllFeaturesSection({ id }: { id?: string }) {


  const features = [
    { name: "Brand voice content with custom knowledge bases", img: "https://cdn.getmerlin.in/cms/brand_voice_hover_image_1_9441c286c4.webp" },
    { name: "Working app snippets, web code and components", img: "https://cdn.getmerlin.in/cms/code_snippets_ad5dd9c340.png" },
    { name: "Flowcharts, mindmaps and 20+ infographic types", img: "https://cdn.getmerlin.in/cms/diagrams_405f737d5d.webp" },
    { name: "Generate images with Flux 1.1 Pro", img: "https://cdn.getmerlin.in/cms/Generate_AI_images_and_art_Bonkers_8edfa01b5b.webp" },
    { name: "Convert YouTube videos into posts and blogs", img: "https://cdn.getmerlin.in/cms/Youtube_Summariser_2161a48f6d.webp" },
    { name: "Posts and comments on X and LinkedIn", img: "https://cdn.getmerlin.in/cms/Twitter_commenter_9b7d00b268.webp" },
    { name: "Solve STEM problems and puzzles with OpenAI o1", img: "https://cdn.getmerlin.in/cms/o1_1_f3cabdfcec.webp" },
    { name: "AI tools for academic, marketing and tech research", img: "https://cdn.getmerlin.in/cms/Chat_with_20_top_AI_models_GPT_4_Claude_3_etc_3b2e6b7e57.webp" },
    { name: "One-click blog summaries", img: "https://cdn.getmerlin.in/cms/Blog_Summariser_91f8e612ef.webp" },
    { name: "Summarize and transcribe YouTube videos", img: "https://cdn.getmerlin.in/cms/Youtube_Transcription_tool_3d92b8ee68.webp" },
  ];

  return (
    <section id={id} className="w-full bg-white dark:bg-black py-20 flex flex-col gap-32">

      {/* All that and more Section */}
      <div className="container mx-auto px-4 xl:px-0">
         <div className="flex flex-col items-center text-center gap-6 mb-16">
            <h2 className="text-[32px] md:text-[56px] font-black leading-[1.1] text-zinc-900 dark:text-white tracking-tighter">
              All that... and more
            </h2>
            <p className="text-xl font-medium text-zinc-500 dark:text-zinc-400 max-w-2xl">
              Here's everything {PLATFORM_NAME} has to offer. P.S. This list grows on every week!
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {features.map((feature, idx) => (
               <div key={idx} className="group flex flex-col gap-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-[24px] p-4 border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden relative">
                  <div className="relative h-[120px] w-full rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                     <Image
                        unoptimized
                        src={feature.img}
                        alt={feature.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <h4 className="font-bold text-zinc-900 dark:text-white text-[15px] leading-snug px-1 relative z-10">
                     {feature.name}
                  </h4>
               </div>
            ))}
         </div>
      </div>

    </section>
  );
}
