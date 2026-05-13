"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiSend } from "react-icons/fi";
import { PLATFORM_NAME } from "@/app/config/platform";

export function Hero({
  signupUrl = "/register",
}: {
  signupUrl?: string;
}) {
  return (
    <section className="relative w-full overflow-hidden bg-black py-20 md:pt-32 pb-20">
      {/* Background Vector */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Image
          src="https://cdn.getmerlin.in/cms/Gradient_Animation_2_a3db99fe6f.png"
          alt="background"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">

        {/* Top Graphics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-12"
        >
          <div className="flex items-center justify-center -space-x-12">
             <div className="relative z-0 transform -rotate-6 translate-y-4">
                <div className="bg-white rounded-lg shadow-2xl p-1 overflow-hidden w-32 h-24 md:w-48 md:h-36">
                  <Image
                    src="https://cdn.getmerlin.in/cms/Chrome_Web_Store_icon_5e2d8a5a4f.svg"
                    alt="Browser"
                    width={200}
                    height={150}
                    className="opacity-20 mt-4 mx-auto"
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  </div>
                </div>
             </div>
             <div className="relative z-20">
                <div className="bg-white rounded-lg shadow-2xl p-1 overflow-hidden w-32 h-40 md:w-48 md:h-60">
                   <div className="p-4 space-y-2">
                     <div className="h-2 w-full bg-gray-100 rounded" />
                     <div className="h-2 w-full bg-gray-100 rounded" />
                     <div className="h-2 w-3/4 bg-gray-100 rounded" />
                     <div className="h-2 w-full bg-gray-100 rounded" />
                     <div className="h-2 w-5/6 bg-gray-100 rounded" />
                     <div className="h-2 w-full bg-gray-100 rounded" />
                     <div className="h-2 w-2/3 bg-gray-100 rounded" />
                   </div>
                </div>
             </div>
             <div className="relative z-10 transform rotate-6 translate-y-4">
                <div className="bg-white rounded-lg shadow-2xl p-1 overflow-hidden w-32 h-24 md:w-48 md:h-36">
                  <Image
                    src="https://cdn.getmerlin.in/cms/Frame_1321318057_c8c5638b09.webp"
                    alt="Photo"
                    width={200}
                    height={150}
                    className="object-cover h-full w-full"
                  />
                </div>
             </div>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-1 bg-white/20 blur-sm rounded-full" />
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-12 flex flex-col items-center"
        >
          <div className="flex items-center gap-4">
            <span className="text-gray-400 blur-[2px] font-serif italic">Charts</span>
            <span className="font-sans">are a chat away</span>
          </div>
        </motion.h1>

        {/* Search-style CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full max-w-3xl"
        >
          <div className="relative flex items-center p-2 bg-[#1a1a1a] rounded-[24px] border border-white/10 group focus-within:border-indigo-500/50 transition-all shadow-2xl">
            <div className="pl-5 text-indigo-400">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path d="M12 2L14.5 9L22 11.5L14.5 14L12 21L9.5 14L2 11.5L9.5 9L12 2Z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Analyze my sales data from last quarter"
              className="w-full bg-transparent border-none focus:ring-0 px-5 py-5 text-xl text-white placeholder-gray-500"
            />
            <button
              className="mr-2 p-4 bg-[#2a2a2a] text-gray-300 rounded-[18px] hover:text-white hover:bg-indigo-600 transition-all active:scale-95"
            >
              <FiSend size={24} />
            </button>
          </div>
        </motion.div>

        {/* Social Proof & Platform badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 flex flex-col items-center gap-8"
        >
          <div className="flex items-center gap-4 text-white/80 font-medium">
             <span>Trusted by 20M+ users</span>
             <div className="w-px h-4 bg-white/20" />
             <span>Install on all platforms</span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4">
            <Link
              href="#"
              className="flex items-center gap-3 bg-white text-black px-6 py-3 rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
            >
              <Image
                src="https://cdn.getmerlin.in/cms/Chrome_Web_Store_icon_5e2d8a5a4f.svg"
                alt="Chrome"
                width={28}
                height={28}
              />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] uppercase font-bold text-gray-500">Available in the</span>
                <span className="text-sm font-bold">Chrome Web Store</span>
              </div>
            </Link>

            <Link
              href="#"
              className="flex items-center gap-3 bg-white text-black px-6 py-3 rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
            >
              <Image
                src="https://cdn.getmerlin.in/cms/Google_Play_logo_64f9907f74.svg"
                alt="Google Play"
                width={28}
                height={28}
              />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] uppercase font-bold text-gray-500">GET IT ON</span>
                <span className="text-sm font-bold">Google Play</span>
              </div>
            </Link>

            <Link
              href="#"
              className="flex items-center gap-3 bg-white text-black px-6 py-3 rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
            >
              <svg viewBox="0 0 384 512" fill="currentColor" className="w-7 h-7">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-31.4-73.3-114.8-1.7-152zM219 114.4c15.7-20 26.2-47.6 23.3-75.1-23.3 1-51.2 15.5-67.9 35.1-14.9 17.5-27.1 46-24.2 72.3 25.4 2 51.1-12.3 68.8-32.3z" />
              </svg>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] uppercase font-bold text-gray-500">Download on the</span>
                <span className="text-sm font-bold">App Store</span>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Side Dots Decor */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
           {[...Array(10)].map((_, i) => (
             <div key={i} className="w-4 h-0.5 bg-white/20" />
           ))}
        </div>

      </div>
    </section>
  );
}
