"use client";
 
import { PLATFORM_NAME } from "@/app/config/platform";
import React from "react";

import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

export function CopiedPricing({ id }: { id?: string }) {
  return (
    <section id={id} className="w-full bg-[#fafafa] dark:bg-black py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center space-y-6 text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white max-w-3xl leading-[1.1]">
            Most valuable AI subscription ever
          </h2>
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 font-medium">
            Untrap yourself from thousands of tools with overlapping features.
          </p>
        </div>

        <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-6 lg:gap-8 relative">
          
          {/* Other Tools Card */}
          <div className="flex flex-col rounded-[2.5rem] bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 p-8 md:p-10 shadow-sm transition-all duration-300 relative z-10 overflow-hidden">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex -space-x-3">
                <div className="h-10 w-10 rounded-full border-2 border-white dark:border-[#111] overflow-hidden bg-white z-30">
                  <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/Avatar_2_eee035b8d3.png" alt="icon" width={40} height={40} className="w-full h-full object-cover" />
                </div>
              </div>
              <span className="text-xl font-bold text-zinc-500 dark:text-zinc-400">Other</span>
            </div>

            <div className="mb-10">
              <div className="flex items-baseline gap-1">
                <span className="text-6xl md:text-7xl font-black text-zinc-900 dark:text-white">$130</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg mt-2 font-medium leading-tight">
                per month<br/>for multiple tools
              </p>
            </div>

            <div className="mt-auto space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Purchased individually</h4>
              
              <div className="space-y-0">
                <div className="flex items-center justify-between py-4 border-b border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/claude_7fd6ca1b3a.svg" alt="Claude AI" width={24} height={24} className="rounded-full" />
                    <span className="font-semibold text-zinc-900 dark:text-zinc-200">Claude AI</span>
                  </div>
                  <span className="font-bold text-zinc-500 dark:text-zinc-400">$30/m</span>
                </div>
                
                <div className="flex items-center justify-between py-4 border-b border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-200">OpenAI</span>
                  </div>
                  <span className="font-bold text-zinc-500 dark:text-zinc-400">$20/m</span>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/gemini_860192f244.svg" alt="Gemini Advanced" width={24} height={24} className="rounded-full" />
                    <span className="font-semibold text-zinc-900 dark:text-zinc-200">Gemini Advanced</span>
                  </div>
                  <span className="font-bold text-zinc-500 dark:text-zinc-400">$20/m</span>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/mistral_997ea81364.svg" alt="Mistral AI" width={24} height={24} className="rounded-full" />
                    <span className="font-semibold text-zinc-900 dark:text-zinc-200">Mistral AI</span>
                  </div>
                  <span className="font-bold text-zinc-500 dark:text-zinc-400">$20/m</span>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/meta_0e8914c0f0.svg" alt="Open source model hosting" width={24} height={24} className="rounded-full" />
                    <span className="font-semibold text-zinc-900 dark:text-zinc-200">Open source model hosting</span>
                  </div>
                  <span className="font-bold text-zinc-500 dark:text-zinc-400">$40/m</span>
                </div>
              </div>
            </div>
          </div>

          {/* {PLATFORM_NAME} Card */}
          <div className="flex flex-col rounded-[2.5rem] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 p-8 md:p-10 relative overflow-hidden shadow-2xl z-20 md:-ml-4 border border-zinc-800 dark:border-zinc-200">
            {/* Background Gradient Effect */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/30 dark:bg-indigo-400/20 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/30 dark:bg-purple-400/20 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-10 w-10 rounded-full border-2 border-zinc-900 dark:border-white overflow-hidden bg-white flex items-center justify-center">
                  <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/Group_2_b0e06c28f9.svg" alt="{PLATFORM_NAME} icon" width={28} height={28} className="object-contain" />
                </div>
                <span className="text-xl font-bold">{PLATFORM_NAME}</span>
              </div>

              <div className="mb-10">
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl md:text-7xl font-black">$19</span>
                </div>
                <p className="text-white/80 dark:text-black/70 text-lg mt-2 font-medium leading-tight">
                  per month<br/>billed annually
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <Link href="/pricing" className="flex-1 flex items-center justify-center px-6 py-3.5 bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white rounded-full font-bold text-[15px] hover:scale-[1.02] transition-transform duration-200">
                  Buy now
                </Link>
                <Link href="/pricing" className="flex-1 flex items-center justify-center px-6 py-3.5 bg-transparent border border-white/20 dark:border-black/20 text-white dark:text-zinc-900 rounded-full font-bold text-[15px] hover:bg-white/5 dark:hover:bg-black/5 transition-colors duration-200">
                  Explore plans
                </Link>
              </div>

              <div className="mt-auto space-y-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/60 dark:text-black/50">One purchase is all it takes.</h4>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 h-6 w-6 rounded-full bg-white/10 dark:bg-black/5 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600 font-bold" strokeWidth={3} />
                    </div>
                    <span className="font-semibold text-lg">All data in one place</span>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1 h-6 w-6 rounded-full bg-white/10 dark:bg-black/5 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600 font-bold" strokeWidth={3} />
                    </div>
                    <span className="font-semibold text-lg">24x7 support at your service</span>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1 h-6 w-6 rounded-full bg-white/10 dark:bg-black/5 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600 font-bold" strokeWidth={3} />
                    </div>
                    <span className="font-semibold text-lg">Great value for money</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

