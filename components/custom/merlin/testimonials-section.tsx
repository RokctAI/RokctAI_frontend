"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import t from "@/app/lib/i18n";
import { PLATFORM_NAME } from "@/app/config/platform";

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

      <div className="relative flex w-full overflow-hidden py-4 group">
        {/* Gradient fades for edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 sm:w-[15%] bg-gradient-to-r from-[#fafafa] to-transparent dark:from-black z-20"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 sm:w-[15%] bg-gradient-to-l from-[#fafafa] to-transparent dark:from-black z-20"></div>

        {/* Single Row - CSS based continuous scroll that pauses on hover */}
        <div className="flex w-max animate-marquee gap-5 py-1 items-center group-hover:[animation-play-state:paused]">
          {repeatedTestimonials.map((t, i) => (
            <div key={`testimonial-${i}`} className="flex w-[350px] shrink-0 flex-col justify-between gap-5 rounded-[1.5rem] border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-[#111] p-6 shadow-sm hover:shadow-md transition-shadow h-full">
               <div className="flex flex-col gap-3">
                 <h4 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">{t.title}</h4>
                 <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-4">{t.text}</p>
               </div>
               <div className="flex items-center gap-3 mt-auto border-t border-zinc-100 dark:border-zinc-800/50 pt-4">
                 <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                   {t.avatar ? (
                     <Image unoptimized referrerPolicy="no-referrer" src={t.avatar} alt={t.author} width={40} height={40} className="object-cover w-full h-full" />
                   ) : (
                     <span className="text-zinc-400 font-bold uppercase">{t.author.charAt(0)}</span>
                   )}
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
