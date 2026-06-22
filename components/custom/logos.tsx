"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const LOGOS = [
  {
    name: "Walmart",
    url: "https://cdn.getmerlin.in/cms/Walmart_logo_transparent_png_1_726d95398d.png",
  },
  {
    name: "Cisco",
    url: "https://cdn.getmerlin.in/cms/Cisco_logo_transparent_png_1_6893663a8e.png",
  },
  {
    name: "Adobe",
    url: "https://cdn.getmerlin.in/cms/Adobe_logo_transparent_png_1_7474a8a5f3.png",
  },
  {
    name: "Amazon",
    url: "https://cdn.getmerlin.in/cms/Amazon_logo_transparent_png_1_8657662862.png",
  },
  {
    name: "Google",
    url: "https://cdn.getmerlin.in/cms/Google_logo_transparent_png_1_5942472714.png",
  },
  {
    name: "Microsoft",
    url: "https://cdn.getmerlin.in/cms/Microsoft_logo_transparent_png_1_9628373322.png",
  },
];

export function Logos() {
  return (
    <section className="w-full bg-white dark:bg-[#0a0a0a] py-12 border-y border-zinc-100 dark:border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
            Trusted by professionals at
          </p>

          <div className="w-full relative">
            <div className="flex items-center justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500 flex-wrap">
              {LOGOS.map((logo) => (
                <motion.div
                  key={logo.name}
                  whileHover={{ scale: 1.1, opacity: 1 }}
                  className="relative h-8 w-24 md:h-12 md:w-40 flex items-center justify-center"
                >
                    <Image
                      src={logo.url}
                      alt={logo.name}
                      width={160}
                      height={48}
                      className="object-contain w-full h-full"
                      unoptimized
                    />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
