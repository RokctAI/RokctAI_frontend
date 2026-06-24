"use client";
import { PLATFORM_NAME } from "@/app/config/platform";
import React, { useRef, useEffect } from "react";
import Image from "next/image";
import t from "@/app/lib/i18n";
 
const TESTIMONIALS = [
  {
    title: "The Swiss Army Knife for research and writing",
    text: `${PLATFORM_NAME} is a welcome addition to anyone looking to simplify their research and writing process. I found the tool to be very user-friendly, fast, and reliable.`,
    author: "PetePlus",
    role: "AppSumo user",
    avatar: "https://cdn.getmerlin.in/cms/Avatar_9274fb1b87.svg"
  },
  {
    title: "Highly recommended for educators, marketers, and small businesses",
    text: "This tool is there for you whenever and wherever you need it. Inside Gmail? Yep. Inside YouTube? Yep. It even timestamps the video summaries. On websites? Yep.",
    author: "Paige Battcher",
    role: `${PLATFORM_NAME} Pro user`,
    avatar: "https://cdn.getmerlin.in/cms/Avatar_1_6e26bd801c.svg"
  },
  {
    title: "5 STAR Product.",
    text: `The team is VERY responsive. Any new ideas or bugs get talked about. They want to make ${PLATFORM_NAME} genuinely really good. You can just tell by how engaged they are, and how they make changes based on feedback.`,
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
    text: `As a student, ${PLATFORM_NAME} AI has been invaluable for my academic work. The tool's automatic summarization and advanced text analysis features have significantly boosted my productivity and understanding.`,
    author: "Preston Bailey",
    role: "Extension user",
    avatar: "https://cdn.getmerlin.in/cms/Avatar_3_7588002be1.svg"
  },
  {
    title: "Amazing support.",
    text: `The reason for gaining trust in ${PLATFORM_NAME} lies in their communication approach. They are more honest in their communication than expected, and while they can't accommodate everything, they provide satisfaction with quick responses to users' demands. I give it 10/10!!`,
    author: "107541488344860181963",
    role: "AppSumo user",
    avatar: "https://cdn.getmerlin.in/cms/Avatar_5_d4cf2b13d4.svg"
  },
  {
    title: "Get straight A+s in uni.",
    text: `My Lil brother had an assignment for UNI, to use an AI to summarize a doc and display the key points using charts, Powerbi, etc.. Everyone used ChatGPT, Gemini, nothing fancy. Lil bro used ${PLATFORM_NAME} per my advise. He got an A+ and doesn't need to attend the finals from this project. I guess the professor thought he's an AI genius. Thanks ${PLATFORM_NAME} 😂🦾`,
    author: "Omar Alsharif",
    role: "Extension user",
    avatar: "https://cdn.getmerlin.in/cms/Avatar_7_e4d61dcb33.png"
  },
  {
    title: "Eliminates the frustration of switching between apps.",
    text: `${PLATFORM_NAME}'s user-friendly interface makes research effortless. By centralizing all my sources, it eliminates the frustration of switching between apps and losing track of valuable information.`,
    author: "Ralphiesworld000",
    role: "Apple App user",
    avatar: "https://cdn.getmerlin.in/cms/Avatar_6_a69724eeab.svg"
  },
  {
    title: "Keyboard friendliness.",
    text: `One of the best looking apps I've seen so far in the AI space. Integrates directly with my browser at the top toolbar. The coolest part is the Cmd + M keyboard friendliness. I've spoken to the developers and can assure that ${PLATFORM_NAME} will only get better with time.`,
    author: "Scorphx",
    role: "Extension user",
    avatar: "https://cdn.getmerlin.in/cms/Avatar_7_430a7c6f7b.svg"
  }
];

export function TestimonialsSection({ id }: { id?: string }) {
  // Duplicate for infinite scroll effect
  const repeatedTestimonials = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section id={id} className="w-full bg-[#fafafa] dark:bg-black py-16 md:py-24 overflow-hidden relative border-t border-zinc-200 dark:border-zinc-900 mt-12 md:mt-24">
      <div className="container mx-auto max-w-6xl flex w-full flex-col items-center justify-center gap-4 px-4 text-center">
         <h2 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-zinc-900 dark:text-white">
            1M+ and counting
         </h2>
         <p className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 pb-1">
            Love for {PLATFORM_NAME} is only growing multifold!
         </p>
         <p className="text-base md:text-lg font-medium text-zinc-600 dark:text-zinc-400 max-w-2xl mt-4">
            What makes us your perfect AI partner? We function on high intelligence, integrity, and energy.
         </p>
      </div>

      <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-12 mt-12 mb-16 max-w-4xl mx-auto px-4">
        <div className="flex flex-col items-center gap-2 group">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-white dark:bg-[#111] shadow-sm border border-zinc-200 dark:border-zinc-800 transition-transform group-hover:scale-105 group-hover:border-blue-500/50">
            <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/image_142_7e8952954b.svg" alt="Chrome" width={24} height={24} />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-black text-zinc-900 dark:text-white">4.8</span>
            <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">Chrome Store</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 group">
          <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-white dark:bg-[#111] shadow-sm border border-zinc-200 dark:border-zinc-800 transition-transform group-hover:scale-105 group-hover:border-purple-500/50">
            <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/Frame_1321318037_dfa4226ae5.svg" alt="AppSumo" width={24} height={24} />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-black text-zinc-900 dark:text-white">4.3</span>
            <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">AppSumo</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 group">
           <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-white dark:bg-[#111] shadow-sm border border-zinc-200 dark:border-zinc-800 transition-transform group-hover:scale-105 group-hover:border-green-500/50">
             <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/playstore_88d0ae5df1.svg" alt={t('common.play_store')} width={24} height={24} />
           </div>
           <div className="flex flex-col items-center">
             <span className="text-xl font-black text-zinc-900 dark:text-white">4.3</span>
             <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">{t('common.play_store')}</span>
           </div>
        </div>

        <div className="flex flex-col items-center gap-2 group">
           <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-white dark:bg-[#111] shadow-sm border border-zinc-200 dark:border-zinc-800 transition-transform group-hover:scale-105 group-hover:border-blue-400/50">
             <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/apple_767823d8d1.svg" alt={t('common.app_store')} width={24} height={24} />
           </div>
           <div className="flex flex-col items-center">
             <span className="text-xl font-black text-zinc-900 dark:text-white">4.7</span>
             <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">{t('common.app_store')}</span>
           </div>
        </div>
      </div>

      <div className="relative flex w-full flex-col gap-5 overflow-hidden py-4 -rotate-2 scale-[1.02] md:scale-105 max-w-[100vw]">
        {/* Gradient fades for edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 sm:w-[15%] bg-gradient-to-r from-[#fafafa] to-transparent dark:from-black z-20"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 sm:w-[15%] bg-gradient-to-l from-[#fafafa] to-transparent dark:from-black z-20"></div>

        {/* Row 1 - Left to Right */}
        <div className="flex w-max animate-marquee gap-5 hover:[animation-play-state:paused] py-1">
          {repeatedTestimonials.slice(0, 10).map((t, i) => (
            <div key={`row1-${i}`} className="flex w-[350px] flex-col justify-between gap-5 rounded-[1.5rem] border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-[#111] p-6 shadow-sm hover:shadow-md transition-shadow">
               <div className="flex flex-col gap-3">
                 <h4 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">{t.title}</h4>
                 <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-4">{t.text}</p>
               </div>
               <div className="flex items-center gap-3 mt-2 border-t border-zinc-100 dark:border-zinc-800/50 pt-4">
                 <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                   <Image unoptimized referrerPolicy="no-referrer" src={t.avatar} alt={t.author} width={40} height={40} className="object-cover w-full h-full" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[200px]">{t.author}</span>
                   <span className="text-xs font-medium text-zinc-500">{t.role}</span>
                 </div>
               </div>
            </div>
          ))}
        </div>

        {/* Row 2 - Right to Left */}
        <div className="flex w-max animate-marquee-reverse gap-5 hover:[animation-play-state:paused] py-1">
          {repeatedTestimonials.slice(5, 15).map((t, i) => (
            <div key={`row2-${i}`} className="flex w-[350px] flex-col justify-between gap-5 rounded-[1.5rem] border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-[#111] p-6 shadow-sm hover:shadow-md transition-shadow">
               <div className="flex flex-col gap-3">
                 <h4 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">{t.title}</h4>
                 <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-4">{t.text}</p>
               </div>
               <div className="flex items-center gap-3 mt-2 border-t border-zinc-100 dark:border-zinc-800/50 pt-4">
                 <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                   <Image unoptimized referrerPolicy="no-referrer" src={t.avatar} alt={t.author} width={40} height={40} className="object-cover w-full h-full" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[200px]">{t.author}</span>
                   <span className="text-xs font-medium text-zinc-500">{t.role}</span>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
