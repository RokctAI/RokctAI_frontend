"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight, FiSearch } from "react-icons/fi";
import { PLATFORM_NAME } from "@/app/config/platform";

export function Hero({
  signupUrl = "/register",
}: {
  signupUrl?: string;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}) {
  return (
    <section className="relative w-full overflow-hidden bg-white dark:bg-black py-20 md:py-32">
      {/* Background Gradient Animation Mock */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50/50 via-transparent to-transparent dark:from-indigo-900/20 opacity-70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Sparkle Icon & Mini Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 mb-8 bg-gray-50 dark:bg-zinc-900 px-4 py-1.5 rounded-full border border-gray-100 dark:border-zinc-800"
        >
          <span className="text-indigo-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4"
            >
              <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z" />
              <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z" />
            </svg>
          </span>
          <span className="text-sm font-medium text-gray-600 dark:text-zinc-400">
            New: {PLATFORM_NAME} Desktop App is here
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-8xl font-black tracking-tighter text-gray-900 dark:text-white mb-6"
        >
          <div className="flex items-center justify-center gap-4">
            <span className="italic">Ideas</span>
            <Image
              src="https://cdn.getmerlin.in/cms/sparkles_d78507fd63.svg"
              alt="Sparkle"
              width={60}
              height={60}
              className="w-10 h-10 md:w-16 md:h-16"
            />
          </div>
          <div className="mt-2">are a chat away</div>
        </motion.h1>

        {/* Search-style CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-2xl mt-8"
        >
          <div className="relative flex items-center p-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 group focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
            <FiSearch className="absolute left-6 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Ask ${PLATFORM_NAME}...`}
              className="w-full bg-transparent border-none focus:ring-0 pl-14 pr-4 py-4 text-lg text-gray-900 dark:text-white placeholder-gray-400"
            />
            <Link
              href={signupUrl}
              className="hidden md:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95 shrink-0"
            >
              Get Started for FREE
              <FiArrowRight />
            </Link>
          </div>
          <Link
            href={signupUrl}
            className="md:hidden flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-xl font-bold mt-4 transition-all shadow-lg active:scale-95"
          >
            Get Started for FREE
            <FiArrowRight />
          </Link>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 flex flex-col items-center gap-6"
        >
          <p className="text-sm font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">
            Trusted by 20M+ users
          </p>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-50 dark:opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Mock Platform Logos */}
            <div className="flex items-center gap-2">
              <Image
                src="https://cdn.getmerlin.in/cms/Chrome_Web_Store_icon_5e2d8a5a4f.svg"
                alt="Chrome"
                width={24}
                height={24}
              />
              <span className="font-bold text-lg">Chrome</span>
            </div>
            <div className="flex items-center gap-2">
              <Image
                src="https://cdn.getmerlin.in/cms/Google_Play_logo_64f9907f74.svg"
                alt="Play Store"
                width={24}
                height={24}
              />
              <span className="font-bold text-lg">Android</span>
            </div>
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 384 512" fill="currentColor" className="w-6 h-6">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-31.4-73.3-114.8-1.7-152zM219 114.4c15.7-20 26.2-47.6 23.3-75.1-23.3 1-51.2 15.5-67.9 35.1-14.9 17.5-27.1 46-24.2 72.3 25.4 2 51.1-12.3 68.8-32.3z" />
              </svg>
              <span className="font-bold text-lg">iOS</span>
            </div>
          </div>
        </motion.div>

        {/* Hero Image Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 w-full max-w-5xl rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.2)] border border-gray-100 dark:border-zinc-800"
        >
          <Image
            src="https://cdn.getmerlin.in/cms/Frame_1321318057_c8c5638b09.webp"
            alt="Product Demo"
            width={1200}
            height={800}
            className="w-full h-auto"
          />
        </motion.div>
      </div>
    </section>
  );
}
