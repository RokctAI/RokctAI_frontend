"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const models = [
  { name: "OpenAI o1", icon: "https://cdn.getmerlin.in/cms/o1_cfad888c7c.webp" },
  { name: "Claude 3.7", icon: "https://cdn.getmerlin.in/cms/claude_7fd6ca1b3a.svg" },
  { name: "DeepSeek R1", icon: "https://cdn.getmerlin.in/cms/Untitled_design_3_ab7522465e.png" },
  { name: "Gemini 2.5", icon: "https://cdn.getmerlin.in/cms/gemini_860192f244.svg" },
  { name: "Mistral Large", icon: "https://cdn.getmerlin.in/cms/mistral_997ea81364.svg" },
  { name: "Llama 3.1", icon: "https://cdn.getmerlin.in/cms/meta_0e8914c0f0.svg" },
  { name: "Grok 3", icon: "https://cdn.getmerlin.in/cms/grok_3_38b2f92210.svg" }
];

export function AIModels() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 dark:text-white mb-4">
          All top AI Models in one
        </h2>
        <p className="text-xl text-gray-500 dark:text-zinc-400 mb-16">
          Instant access to latest models as soon as they’re live for FREE.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8">
          {models.map((model, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center gap-4 group"
            >
              <div className="w-16 h-16 relative flex items-center justify-center bg-white dark:bg-zinc-900 rounded-2xl shadow-md border border-gray-100 dark:border-zinc-800 group-hover:shadow-xl transition-all group-hover:-translate-y-1">
                <Image
                  src={model.icon}
                  alt={model.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain"
                />
              </div>
              <span className="text-sm font-bold text-gray-600 dark:text-zinc-400">
                {model.name}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="mt-20">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95">
            Hell yeah, I want this!
          </button>
        </div>
      </div>
    </section>
  );
}
