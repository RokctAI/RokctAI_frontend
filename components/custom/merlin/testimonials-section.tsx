"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import t from "@/app/lib/i18n";
 
const TESTIMONIALS = [
  {
    title: "The Swiss Army Knife for research and writing",
    text: "Merlin is a welcome addition to anyone looking to simplify their research and writing process. I found the tool to be very user-friendly, fast, and reliable.",
    author: "PetePlus",
    role: "AppSumo user",
    avatar: "https://cdn.getmerlin.in/cms/Avatar_9274fb1b87.svg"
  },
  {
    title: "Highly recommended for educators, marketers, and small businesses",
    text: "This tool is there for you whenever and wherever you need it. Inside Gmail? Yep. Inside YouTube? Yep. It even timestamps the video summaries. On websites? Yep.",
    author: "Paige Battcher",
    role: "Merlin Pro user",
    avatar: "https://cdn.getmerlin.in/cms/Avatar_1_6e26bd801c.svg"
  },
  {
    title: "5 STAR Product.",
    text: "The team is VERY responsive. Any new ideas or bugs get talked about. They want to make Merlin genuinely really good. You can just tell by how engaged they are, and how they make changes based on feedback.",
    author: "gkc",
    role: "AppSumo user",
    avatar: "https://cdn.getmerlin.in/cms/Avatar_2_aa8dbc93fb.svg"
  },
  {
    title: "There when and where you need it.",
    text: "This tool is there for you whenever and wherever you need it. Inside Gmail? Yep. Inside YouTube? Yep. It even timestamps the video summaries. On websites? Yep.",
    author: "Nathalia Do Nascimento Silva",
    role: "AppSumo user",
    avatar: "https://cdn.getmerlin.in/cms/Avatar_4_36664caa88.svg"
  },
  {
    title: "An indispensable part of my academic toolkit.",
    text: "As a student, Merlin AI has been invaluable for my academic work. The tool's automatic summarization and advanced text analysis features have significantly boosted my productivity and understanding.",
    author: "Preston Bailey",
    role: "Extension user",
    avatar: "https://cdn.getmerlin.in/cms/Avatar_3_7588002be1.svg"
  },
  {
    title: "Amazing support.",
    text: "The reason for gaining trust in Merlin lies in their communication approach. They are more honest in their communication than expected, and while they can't accommodate everything, they provide satisfaction with quick responses to users' demands. I give it 10/10!!",
    author: "107541488344860181963",
    role: "AppSumo user",
    avatar: "https://cdn.getmerlin.in/cms/Avatar_5_d4cf2b13d4.svg"
  },
  {
    title: "Get straight A+s in uni.",
    text: "My Lil brother had an assignment for UNI, to use an AI to summarize a doc and display the key points using charts, Powerbi, etc.. Everyone used ChatGPT, Gemini, nothing fancy. Lil bro used Merlin per my advise. He got an A+ and doesn't need to attend the finals from this project. I guess the professor thought he's an AI genius. Thanks Merlin 😂🦾",
    author: "Omar Alsharif",
    role: "Extension user",
    avatar: "https://cdn.getmerlin.in/cms/Avatar_7_e4d61dcb33.png"
  },
  {
    title: "Eliminates the frustration of switching between apps.",
    text: "Merlin's user-friendly interface makes research effortless. By centralizing all my sources, it eliminates the frustration of switching between apps and losing track of valuable information.",
    author: "Ralphiesworld000",
    role: "Apple App user",
    avatar: "https://cdn.getmerlin.in/cms/Avatar_6_a69724eeab.svg"
  },
  {
    title: "Keyboard friendliness.",
    text: "One of the best looking apps I've seen so far in the AI space. Integrates directly with my browser at the top toolbar. The coolest part is the Cmd + M keyboard friendliness. I've spoken to the developers and can assure that Merlin will only get better with time.",
    author: "Scorphx",
    role: "Extension user",
    avatar: "https://cdn.getmerlin.in/cms/Avatar_7_430a7c6f7b.svg"
  }
];

export function TestimonialsSection({ id }: { id?: string }) {
  // Duplicate for infinite scroll effect
  const repeatedTestimonials = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section id={id} className="container flex w-full flex-col gap-12 py-24 bg-white dark:bg-black mx-auto overflow-hidden">
      <div className="flex w-full flex-col items-center justify-center gap-6 px-4 text-center">
         <h2 className="text-[32px] font-black leading-[1.2] text-zinc-900 dark:text-white md:text-[56px] md:leading-[1.1]">
            1M+ and counting
         </h2>
         <p className="text-[32px] font-black leading-[1.2] text-zinc-900 dark:text-white md:text-[56px] md:leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 pb-2">
            Love for Merlin is only growing multifold!
         </p>
         <p className="text-xl font-medium text-zinc-500 dark:text-zinc-400 max-w-2xl mt-4">
            What makes us your perfect AI partner? We function on high intelligence, integrity, and energy.
         </p>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 mt-8">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800">
            <Image unoptimized src="https://cdn.getmerlin.in/cms/image_142_7e8952954b.svg" alt="Chrome" width={32} height={32} />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black">4.8</span>
            <span className="text-sm font-medium text-zinc-500">Chrome Store</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800">
            <Image unoptimized src="https://cdn.getmerlin.in/cms/Frame_1321318037_dfa4226ae5.svg" alt="AppSumo" width={32} height={32} />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black">4.3</span>
            <span className="text-sm font-medium text-zinc-500">AppSumo</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
           <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800">
             <Image unoptimized src="https://cdn.getmerlin.in/cms/playstore_88d0ae5df1.svg" alt={t('common.play_store')} width={32} height={32} />
           </div>
           <div className="flex flex-col items-center">
             <span className="text-2xl font-black">4.3</span>
             <span className="text-sm font-medium text-zinc-500">{t('common.play_store')}</span>
           </div>
        </div>

        <div className="flex flex-col items-center gap-2">
           <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800">
             <Image unoptimized src="https://cdn.getmerlin.in/cms/apple_767823d8d1.svg" alt={t('common.app_store')} width={32} height={32} />
           </div>
           <div className="flex flex-col items-center">
             <span className="text-2xl font-black">4.7</span>
             <span className="text-sm font-medium text-zinc-500">{t('common.app_store')}</span>
           </div>
        </div>
      </div>

      <div className="relative mt-16 flex w-full flex-col gap-6 overflow-hidden">
        {/* Row 1 - Left to Right */}
        <div className="flex w-max animate-marquee gap-6 hover:[animation-play-state:paused]">
          {repeatedTestimonials.slice(0, 10).map((t, i) => (
            <div key={`row1-${i}`} className="flex w-[400px] flex-col justify-between gap-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
               <div className="flex flex-col gap-4">
                 <h4 className="text-xl font-bold text-zinc-900 dark:text-white">{t.title}</h4>
                 <p className="text-base text-zinc-600 dark:text-zinc-400">{t.text}</p>
               </div>
               <div className="flex items-center gap-4 mt-4">
                 <div className="h-12 w-12 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                   <Image unoptimized src={t.avatar} alt={t.author} width={48} height={48} className="object-cover" />
                 </div>
                 <div className="flex flex-col">
                   <span className="font-bold text-zinc-900 dark:text-white">{t.author}</span>
                   <span className="text-sm text-zinc-500">{t.role}</span>
                 </div>
               </div>
            </div>
          ))}
        </div>

        {/* Row 2 - Right to Left */}
        <div className="flex w-max animate-marquee-reverse gap-6 hover:[animation-play-state:paused]">
          {repeatedTestimonials.slice(5, 15).map((t, i) => (
            <div key={`row2-${i}`} className="flex w-[400px] flex-col justify-between gap-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
               <div className="flex flex-col gap-4">
                 <h4 className="text-xl font-bold text-zinc-900 dark:text-white">{t.title}</h4>
                 <p className="text-base text-zinc-600 dark:text-zinc-400">{t.text}</p>
               </div>
               <div className="flex items-center gap-4 mt-4">
                 <div className="h-12 w-12 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                   <Image unoptimized src={t.avatar} alt={t.author} width={48} height={48} className="object-cover" />
                 </div>
                 <div className="flex flex-col">
                   <span className="font-bold text-zinc-900 dark:text-white">{t.author}</span>
                   <span className="text-sm text-zinc-500">{t.role}</span>
                 </div>
               </div>
            </div>
          ))}
        </div>

        {/* Gradient fades for edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-white to-transparent dark:from-black"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-white to-transparent dark:from-black"></div>
      </div>
    </section>
  );
}
