"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Inline custom icon for standard CheckIcon to avoid import errors if not present
const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"/></svg>
);

export function CopiedPricing({ id }: { id?: string }) {
  return (
    <section id={id} className="container flex w-full flex-col gap-12 py-24 bg-white dark:bg-black mx-auto">
      <div className="flex w-full flex-col items-center justify-center gap-6 px-4 text-center">
         <h2 className="text-[32px] font-black leading-[1.2] text-zinc-900 dark:text-white md:text-[56px] md:leading-[1.1]">
            Most valuable AI subscription ever
         </h2>
         <p className="text-xl font-medium text-zinc-500 dark:text-zinc-400 max-w-2xl">
            Untrap yourself from thousands of tools with overlapping features.
         </p>
      </div>

      <div className="flex w-full max-w-6xl flex-col gap-8 px-4 xl:px-0 mx-auto mt-8 md:flex-row">
         {/* Other Tools Card */}
         <div className="flex w-full md:w-1/2 flex-col rounded-[32px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-8 md:p-12">
            <div className="flex items-center gap-4 mb-8">
               <div className="flex -space-x-4">
                  <div className="h-12 w-12 rounded-full border-2 border-white dark:border-black overflow-hidden bg-white">
                     <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/gemini_860192f244.svg" alt="icon" width={48} height={48} className="object-cover" />
                  </div>
                  <div className="h-12 w-12 rounded-full border-2 border-white dark:border-black overflow-hidden bg-white">
                     <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/claude_7fd6ca1b3a.svg" alt="icon" width={48} height={48} className="object-cover" />
                  </div>
                  <div className="h-12 w-12 rounded-full border-2 border-white dark:border-black overflow-hidden bg-white flex items-center justify-center">
                     <span className="text-xs font-bold text-black">+4</span>
                  </div>
               </div>
               <span className="text-2xl font-bold text-zinc-500 dark:text-zinc-400">Other</span>
            </div>

            <div className="flex flex-col gap-2 mb-12">
               <div className="flex items-end gap-2">
                  <span className="text-6xl font-black text-zinc-900 dark:text-white">$130</span>
               </div>
               <span className="text-lg font-medium text-zinc-500 dark:text-zinc-400">per month<br/>for multiple tools</span>
            </div>

            <div className="flex flex-col gap-6 mt-auto">
               <span className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Purchased individually</span>

               <div className="flex items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                     <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/claude_7fd6ca1b3a.svg" alt="Claude" width={24} height={24} />
                     <span className="font-medium text-zinc-900 dark:text-white">Claude AI</span>
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-white">$30/m</span>
               </div>

               <div className="flex items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                     <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                     </div>
                     <span className="font-medium text-zinc-900 dark:text-white">OpenAI</span>
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-white">$20/m</span>
               </div>

               <div className="flex items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                     <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/gemini_860192f244.svg" alt="Gemini" width={24} height={24} />
                     <span className="font-medium text-zinc-900 dark:text-white">Gemini Advanced</span>
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-white">$20/m</span>
               </div>

               <div className="flex items-center justify-between py-4 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                     <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/mistral_997ea81364.svg" alt="Mistral" width={24} height={24} />
                     <span className="font-medium text-zinc-900 dark:text-white">Mistral AI</span>
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-white">$20/m</span>
               </div>

               <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                     <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/meta_0e8914c0f0.svg" alt="Meta" width={24} height={24} />
                     <span className="font-medium text-zinc-900 dark:text-white">Open source model hosting</span>
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-white">$40/m</span>
               </div>
            </div>
         </div>

         {/* Merlin Card */}
         <div className="flex w-full md:w-1/2 flex-col rounded-[32px] bg-zinc-900 dark:bg-white text-white dark:text-black p-8 md:p-12 relative overflow-hidden shadow-2xl">
            {/* Background decorative gradient */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl -z-10 rounded-full translate-x-1/3 -translate-y-1/3"></div>

            <div className="flex items-center gap-4 mb-8">
               <div className="flex -space-x-4">
                  <div className="h-12 w-12 rounded-full border-2 border-zinc-900 dark:border-white overflow-hidden bg-white flex items-center justify-center">
                     <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/Group_2_b0e06c28f9.svg" alt="icon" width={32} height={32} />
                  </div>
               </div>
               <span className="text-2xl font-bold">Merlin</span>
            </div>

            <div className="flex flex-col gap-2 mb-12">
               <div className="flex items-end gap-2">
                  <span className="text-6xl font-black">$19</span>
               </div>
               <span className="text-lg font-medium opacity-80">per month<br/>billed annually</span>
            </div>

            <div className="flex flex-col gap-4 mb-12">
               <Link href="/pricing" className="w-full py-4 bg-white text-black dark:bg-black dark:text-white rounded-full font-bold text-center text-lg hover:scale-[1.02] transition-transform">
                  Buy now
               </Link>
               <Link href="/pricing" className="w-full py-4 bg-transparent border border-white/20 dark:border-black/20 text-white dark:text-black rounded-full font-bold text-center text-lg hover:bg-white/5 dark:hover:bg-black/5 transition-colors">
                  Explore plans
               </Link>
            </div>

            <div className="flex flex-col gap-6 mt-auto">
               <span className="text-sm font-bold uppercase tracking-wider opacity-60">One purchase is all it takes.</span>

               <div className="flex items-center gap-4 py-3">
                  <div className="h-8 w-8 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center">
                     <CheckIcon className="w-5 h-5 text-green-400 dark:text-green-600" />
                  </div>
                  <span className="font-bold text-lg">All data in one place</span>
               </div>

               <div className="flex items-center gap-4 py-3">
                  <div className="h-8 w-8 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center">
                     <CheckIcon className="w-5 h-5 text-green-400 dark:text-green-600" />
                  </div>
                  <span className="font-bold text-lg">24x7 support at your service</span>
               </div>

               <div className="flex items-center gap-4 py-3">
                  <div className="h-8 w-8 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center">
                     <CheckIcon className="w-5 h-5 text-green-400 dark:text-green-600" />
                  </div>
                  <span className="font-bold text-lg">Great value for money</span>
               </div>
            </div>
         </div>
      </div>
    </section>
  );
}
