"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const LOGOS = [
  {
    name: "Walmart",
    url: "https://cdn.getmerlin.in/cms/Walmart_1_0cd05c542e.png",
  },
  {
    name: "Cisco",
    url: "https://cdn.getmerlin.in/cms/Cisco_1_ab0ee6173d.png",
  },
  {
    name: "Netflix",
    url: "https://cdn.getmerlin.in/cms/Netflix_1_dabb0f82d5.png",
  },
  {
    name: "Pinterest",
    url: "https://cdn.getmerlin.in/cms/Pinterest_1_25eeb74ab0.png",
  },
  {
    name: "Zoom",
    url: "https://cdn.getmerlin.in/cms/Zoom_1_b5d03a6d69.png",
  },
  {
    name: "Sony",
    url: "https://cdn.getmerlin.in/cms/Sony_1_e475b6ed27.png",
  },
  {
    name: "Ebay",
    url: "https://cdn.getmerlin.in/cms/Ebay_1_dbfa7af44d.png",
  },
  {
    name: "Uber",
    url: "https://cdn.getmerlin.in/cms/Uber_1_338311f3dc.png",
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

          <div className="w-full relative overflow-hidden">
            <div className="flex items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500 overflow-x-auto whitespace-nowrap scrollbar-hide w-full max-w-full">

              {LOGOS.map((logo) => (
                <motion.div
                  key={logo.name}
                  whileHover={{ scale: 1.1, opacity: 1 }}
                  className="relative h-8 w-24 md:h-12 md:w-40 flex items-center justify-center"
                >
                    <Image
                      src={logo.url}
                      alt={logo.name}
                      fill
                      className="object-contain"
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
