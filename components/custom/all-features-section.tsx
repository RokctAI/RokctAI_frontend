"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { PLATFORM_NAME } from "@/app/config/platform";

export function AllFeaturesSection({ id }: { id?: string }) {
  const models = [
    { name: "Claude 3.7 Sonnet with thinking", img: "https://cdn.getmerlin.in/cms/claude_7fd6ca1b3a.svg" },
    { name: "DeepSeek R1", img: "https://cdn.getmerlin.in/cms/Untitled_design_3_ab7522465e.png" },
    { name: "Gemini 2.5 Pro and Flash", img: "https://cdn.getmerlin.in/cms/gemini_860192f244.svg" },
    { name: "Mistral Large", img: "https://cdn.getmerlin.in/cms/mistral_997ea81364.svg" },
    { name: "Llama 3.1 405B", img: "https://cdn.getmerlin.in/cms/meta_0e8914c0f0.svg" },
    { name: "Grok 3", img: "https://cdn.getmerlin.in/cms/grok_3_38b2f92210.svg" },
  ];

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

      {/* Top Models Section */}
      <div className="container mx-auto px-4 xl:px-0">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-[40px] p-8 md:p-16 border border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col gap-8 w-full lg:w-1/2">
            <h2 className="text-[32px] md:text-[56px] font-black leading-[1.1] text-zinc-900 dark:text-white tracking-tighter">
              All top AI Models in one
            </h2>
            <div className="flex flex-col gap-6">
              <p className="text-xl font-medium text-zinc-500 dark:text-zinc-400 max-w-md">
                Instant access to latest models as soon as they're live for FREE.
              </p>
              <div className="flex items-center gap-4 text-lg font-bold text-zinc-800 dark:text-zinc-200">
                <div className="flex -space-x-4">
                   <div className="w-10 h-10 rounded-full bg-[#10A37F] border-2 border-white dark:border-zinc-900 flex items-center justify-center relative z-30 shadow-md">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.073Zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944Zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464ZM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956Zm16.0993 3.8558L12.596 8.3829 14.6161 7.2144a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.3927-.6813Zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L8.809 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.6684Zm-12.0854-1.918a4.4944 4.4944 0 0 1 2.8669 1.0408l-.1419.0804-4.783 2.7582a.7948.7948 0 0 0-.3927.6813v6.7369l-2.02-1.1686a.071.071 0 0 1-.038-.052V6.3135a4.504 4.504 0 0 1 4.4945-4.4944Zm2.0201 2.4578l-4.1437 2.3846v-4.769l4.1437-2.3846 4.1437 2.3846v4.769l-4.1437-2.3846Z"/></svg>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-zinc-900 border-2 border-white dark:border-zinc-900 flex items-center justify-center relative z-20 shadow-md overflow-hidden">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                   </div>
                </div>
                <span>o3, o4-mini and GPT 4.1</span>
              </div>
            </div>

            <Link
              href="/chat"
              className="flex w-fit items-center justify-center rounded-full bg-[#4F46E5] px-8 py-4 text-lg font-bold text-white transition-transform hover:scale-105 shadow-xl shadow-indigo-500/20"
            >
              Hell yeah, I want this!
            </Link>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col gap-4">
             {models.map((model, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-white dark:bg-black rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group">
                   <div className="w-12 h-12 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center p-2 relative shrink-0">
                      <Image unoptimized src={model.img} alt={model.name} fill className="object-contain p-2" />
                   </div>
                   <span className="font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-[#4F46E5] transition-colors">{model.name}</span>
                </div>
             ))}
          </div>
        </div>
      </div>

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
