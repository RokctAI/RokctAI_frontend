"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { PLATFORM_NAME } from "@/app/config/platform";
import { motion, AnimatePresence } from "framer-motion";

export function CopiedPricing({ id }: { id?: string }) {
  // State to manage which card is at the front
  // 0 = Merlin/Platform card at front
  // 1 = Other card at front
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  
  // State for active file divider category
  const [activeCategory, setActiveCategory] = useState("AI Subscriptions");

  const categories = [
    "AI Subscriptions",
    "Analytics Tools",
    "Marketing Suites",
    "Design Software"
  ];

  return (
    <section id={id} className="w-full bg-[#fafafa] dark:bg-black py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white max-w-2xl leading-[1.1]">
            Most valuable AI subscription ever
          </h2>
          <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 font-medium">
            Untrap yourself from thousands of tools with overlapping features.
          </p>
        </div>

        <div className="relative min-h-[600px] max-w-3xl mx-auto flex">
          
          {/* Deck of Cards Container */}
          <div className="flex-1 relative h-[650px] lg:h-[600px] w-full">
            
            {/* OTHER TOOLS CARD */}
            <motion.div 
              onClick={() => setActiveCardIndex(1)}
              className="absolute top-0 bottom-0 cursor-pointer outline-none flex items-stretch"
              animate={{
                zIndex: activeCardIndex === 1 ? 20 : 10,
                left: activeCardIndex === 1 ? "0%" : "0%", x: activeCardIndex === 1 ? "5%" : "0%",
                scale: activeCardIndex === 1 ? 1 : 0.95,
                opacity: activeCardIndex === 1 ? 1 : 0.6,
                filter: activeCardIndex === 1 ? "brightness(1)" : "brightness(0.7)",
                rotateY: activeCardIndex === 1 ? 0 : 5,
                originX: 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ perspective: 1000 }}
            >
              {/* File Divider Ear */}
              <div className="absolute -left-12 top-[180px] hidden lg:flex">
                <div onClick={() => setActiveCardIndex(1)} className={`border border-r-0 border-zinc-200 dark:border-zinc-800 rounded-l-xl py-8 w-12 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.1)] transition-colors duration-300 flex items-center justify-center ${activeCardIndex === 1 ? 'bg-white dark:bg-[#111] z-20' : 'bg-zinc-100 dark:bg-zinc-800 cursor-pointer z-0'}`}>
                  <span className={`font-bold text-sm -rotate-90 whitespace-nowrap tracking-widest ${activeCardIndex === 1 ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>Other Tools</span>
                </div>
              </div>
              <div className="w-full flex flex-col rounded-[2rem] bg-white dark:bg-[#111] border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 md:px-12 shadow-2xl transition-colors duration-300 relative overflow-hidden h-full hover:border-zinc-300 dark:hover:border-zinc-700 z-10">
                {activeCardIndex !== 1 && (
                  <div className="absolute inset-0 bg-white/40 dark:bg-black/40 z-50 rounded-[2rem] pointer-events-none" />
                )}
                
                <div className="flex items-center gap-3 mb-5 relative z-40">
                  <div className="flex -space-x-2">
                    <div className="h-8 w-8 rounded-full border-2 border-white dark:border-[#111] overflow-hidden bg-white">
                      <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/Avatar_2_eee035b8d3.png" alt="icon" width={32} height={32} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <span className="text-lg font-bold text-zinc-500 dark:text-zinc-400">Other</span>
                </div>

                <div className="mb-8 relative z-40">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl md:text-6xl font-black text-zinc-900 dark:text-white">$130</span>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1.5 font-medium leading-tight">
                    per month<br/>for multiple tools
                  </p>
                </div>

                <div className="mt-auto space-y-4 relative z-40">
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
            </motion.div>

            {/* PLATFORM CARD */}
            <motion.div 
              onClick={() => setActiveCardIndex(0)}
              className="absolute top-0 bottom-0 cursor-pointer outline-none flex items-stretch"
              animate={{
                zIndex: activeCardIndex === 0 ? 20 : 10,
                left: activeCardIndex === 0 ? "0%" : "0%", x: activeCardIndex === 0 ? "5%" : "0%",
                scale: activeCardIndex === 0 ? 1 : 0.95,
                opacity: activeCardIndex === 0 ? 1 : 0.6,
                filter: activeCardIndex === 0 ? "brightness(1)" : "brightness(0.7)",
                rotateY: activeCardIndex === 0 ? 0 : -5,
                originX: 1
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ perspective: 1000 }}
            >
              {/* File Divider Ear */}
              <div className="absolute -left-12 top-16 hidden lg:flex">
                <div onClick={() => setActiveCardIndex(0)} className={`border border-r-0 border-zinc-800 dark:border-zinc-200 rounded-l-xl py-8 w-12 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.3)] transition-colors duration-300 flex items-center justify-center ${activeCardIndex === 0 ? 'bg-zinc-900 dark:bg-white z-20' : 'bg-zinc-800 dark:bg-zinc-100 cursor-pointer z-0'}`}>
                  <span className={`font-bold text-sm -rotate-90 whitespace-nowrap tracking-widest ${activeCardIndex === 0 ? 'text-white dark:text-zinc-900' : 'text-zinc-400 dark:text-zinc-600'}`}>AI Subscriptions</span>
                </div>
              </div>
              <div className="w-full flex flex-col rounded-[2rem] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 p-6 md:p-8 md:px-12 relative overflow-hidden shadow-2xl border border-zinc-800 dark:border-zinc-200 h-full hover:border-zinc-700 dark:hover:border-zinc-300 transition-colors duration-300 z-10">
                {activeCardIndex !== 0 && (
                  <div className="absolute inset-0 bg-black/40 dark:bg-white/40 z-50 rounded-[2rem] pointer-events-none" />
                )}

                {/* Background Gradient Effect */}
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/30 dark:bg-indigo-400/20 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/30 dark:bg-purple-400/20 blur-[80px] rounded-full pointer-events-none"></div>

                <div className="relative z-40 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-8 w-8 rounded-full border-2 border-zinc-900 dark:border-white overflow-hidden bg-white flex items-center justify-center">
                      <Image unoptimized referrerPolicy="no-referrer" src="https://cdn.getmerlin.in/cms/Group_2_b0e06c28f9.svg" alt={`${PLATFORM_NAME} icon`} width={20} height={20} className="object-contain" />
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
            </motion.div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
