/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export function SecuritySection({ id }: { id?: string }) {
  const cards = [
    {
      title: "Industry-grade data security",
      description:
        "GDPR, ISO 27001, AICPA SOC 2 certification for industry-standard data security.",
      image: "https://cdn.getmerlin.in/cms/Frame_1321318025_5_0a00fc2b21.png",
    },
    {
      title: "Make your own prompt library",
      description:
        "Automate generation of text, comments and posts with one click.",
      image: "https://cdn.getmerlin.in/cms/Frame_1321318025_8_db66981d2c.png",
    },
    {
      title: "Create custom bots",
      description:
        "String instructions, context and knowledge together to create custom chatbots.",
      image: "https://cdn.getmerlin.in/cms/Frame_1321318025_1_81fb6cae7e.png",
    },
  ];

  return (
    <section id={id} className="w-full bg-white dark:bg-black py-20 pb-32">
      <div className="container mx-auto px-4 xl:px-0 flex w-full flex-col gap-12">
        <div className="flex w-full flex-col items-center justify-normal px-4 md:flex-row md:justify-between xl:px-0">
          <h2 className="text-foreground font-serif tracking-wide mb-6 w-full max-w-md text-center text-[32px] md:text-[56px] font-black leading-[1.1] md:mb-0 md:text-left">
            Secure and customizable
          </h2>
          <div className="flex w-full max-w-md flex-col gap-4">
            <p className="font-sans text-center text-xl font-medium text-muted-foreground md:text-left">
              Build custom solutions that adapt to your context, knowledge or
              brand voice, with industry-leading security.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-stretch justify-center gap-8 lg:justify-between">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex w-full max-w-[380px] flex-col group"
            >
              <div className="relative h-56 w-full shrink-0 overflow-hidden rounded-[24px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <Image
                  unoptimized
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex grow flex-col gap-3 pt-6 px-2">
                <h4 className="text-foreground font-serif text-2xl font-bold tracking-tight">
                  {card.title}
                </h4>
                <p className="font-sans text-lg font-medium text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
