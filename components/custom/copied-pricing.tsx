"use client";
 
import { PLATFORM_NAME } from "@/app/config/platform";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

export function CopiedPricing({ id }: { id?: string }) {
  return (
    <section id={id} className="w-full bg-[#fafafa] dark:bg-black py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white max-w-2xl leading-[1.1]">
            Most valuable AI subscription ever
          </h2>
          <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 font-medium">
            Untrap yourself from thousands of tools with overlapping features.
          </p>
        </div>

        <div className="mx-auto max-w-4xl grid md:grid-cols-2 gap-4 lg:gap-6 relative">
          
          {/* Other Tools Card */}
          <div className="flex flex-col rounded-[2rem] bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm transition-all duration-300 relative z-10 overflow-hidden">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full border-2 border-white dark:border-[#111] overflow-hidden bg-white z-30">
                  <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/Avatar_2_eee035b8d3.png" alt="icon" width={32} height={32} className="w-full h-full object-cover" />
                </div>
              </div>
              <span className="text-lg font-bold text-zinc-500 dark:text-zinc-400">Other</span>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl md:text-6xl font-black text-zinc-900 dark:text-white">$130</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1.5 font-medium leading-tight">
                per month<br/>for multiple tools
              </p>
            </div>

            <div className="mt-auto space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Purchased individually</h4>
              
              <div className="space-y-0">
                <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/claude_7fd6ca1b3a.svg" alt="Claude AI" width={20} height={20} className="rounded-full" />
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">Claude AI</span>
                  </div>
                  <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400">$30/m</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">OpenAI</span>
                  </div>
                  <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400">$20/m</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/gemini_860192f244.svg" alt="Gemini Advanced" width={20} height={20} className="rounded-full" />
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">Gemini Advanced</span>
                  </div>
                  <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400">$20/m</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/mistral_997ea81364.svg" alt="Mistral AI" width={20} height={20} className="rounded-full" />
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">Mistral AI</span>
                  </div>
                  <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400">$20/m</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/meta_0e8914c0f0.svg" alt="Open source model hosting" width={20} height={20} className="rounded-full" />
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">Open source model hosting</span>
                  </div>
                  <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400">$40/m</span>
                </div>
              </div>
            </div>
          </div>

          {/* {PLATFORM_NAME} Card */}
          <div className="flex flex-col rounded-[2rem] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 p-6 md:p-8 relative overflow-hidden shadow-2xl z-20 md:-ml-4 border border-zinc-800 dark:border-zinc-200">
            {/* Background Gradient Effect */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/30 dark:bg-indigo-400/20 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/30 dark:bg-purple-400/20 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-8 w-8 rounded-full border-2 border-zinc-900 dark:border-white overflow-hidden bg-white flex items-center justify-center">
                  <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/Group_2_b0e06c28f9.svg" alt="{PLATFORM_NAME} icon" width={20} height={20} className="object-contain" />
                </div>
                <span className="text-lg font-bold">{PLATFORM_NAME}</span>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl md:text-6xl font-black">$19</span>
                </div>
                <p className="text-white/80 dark:text-black/70 text-sm mt-1.5 font-medium leading-tight">
                  per month<br/>billed annually
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 mb-10">
                <Link href="/pricing" className="flex-1 flex items-center justify-center px-4 py-2.5 bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white rounded-full font-bold text-sm hover:scale-[1.02] transition-transform duration-200">
                  Buy now
                </Link>
                <Link href="/pricing" className="flex-1 flex items-center justify-center px-4 py-2.5 bg-transparent border border-white/20 dark:border-black/20 text-white dark:text-zinc-900 rounded-full font-bold text-sm hover:bg-white/5 dark:hover:bg-black/5 transition-colors duration-200">
                  Explore plans
                </Link>
              </div>

              <div className="mt-auto space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/60 dark:text-black/50">One purchase is all it takes.</h4>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-5 w-5 rounded-full bg-white/10 dark:bg-black/5 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-400 dark:text-emerald-600 font-bold" strokeWidth={3} />
                    </div>
                    <span className="font-semibold text-base">All data in one place</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-5 w-5 rounded-full bg-white/10 dark:bg-black/5 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-400 dark:text-emerald-600 font-bold" strokeWidth={3} />
                    </div>
                    <span className="font-semibold text-base">24x7 support at your service</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-5 w-5 rounded-full bg-white/10 dark:bg-black/5 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-400 dark:text-emerald-600 font-bold" strokeWidth={3} />
                    </div>
                    <span className="font-semibold text-base">Great value for money</span>
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
