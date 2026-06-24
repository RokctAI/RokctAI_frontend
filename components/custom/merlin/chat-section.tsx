"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { PLATFORM_NAME } from "@/app/config/platform";
import { MoveRight } from "lucide-react";

export function ChatSection({ id }: { id?: string }) {
  return (
    <section
      id={id}
      className="container flex w-full flex-col gap-12 py-24 mx-auto relative items-center justify-center"
    >
      <div className="flex w-full flex-col items-center justify-center gap-6 px-4 xl:px-0 text-center">
        <div className="inline-flex items-center py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow hover:bg-blue-600/80 dark:border-blue-400-muted rounded-sm border border-blue-600 bg-background px-3 text-blue-600 dark:text-blue-400">
          NEW · {PLATFORM_NAME} Chat
        </div>
        <h2 className="text-foreground font-serif w-full text-center text-3xl font-medium tracking-normal md:text-5xl">
          For those who build
        </h2>
        <h4 className="font-sans font-medium text-center text-lg text-muted-foreground md:text-2xl">
          Research with realtime info, visualise insights and build products
          with words.
        </h4>
        <div className="mt-4">
          <Link
            href="/chat"
            className="flex w-max items-center rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 text-sm font-semibold shadow hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Explore now
            <MoveRight className="ml-2 size-4" />
          </Link>
        </div>
      </div>

      <div className="relative flex items-center justify-center w-full max-w-[1400px] mt-8 px-4 xl:px-0">
        <div className="flex w-full flex-wrap justify-center gap-8 lg:gap-6 xl:gap-8">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="min-w-0 shrink-0 grow-0 basis-full md:basis-[45%] lg:basis-[28%] flex justify-center p-0"
          >
            <div className="flex w-[326px] flex-col gap-4">
              <div className="relative h-[366px] w-full overflow-hidden rounded-lg">
                <Image
                  src="https://cdn.getmerlin.in/cms/projects_33be20ddec.webp"
                  alt="Projects"
                  fill
                  className="rounded-lg object-cover transition-opacity duration-300 ease-in-out opacity-100 group-hover:opacity-90"
                />
              </div>
              <div className="flex flex-col gap-1 z-10">
                <h4 className="text-foreground font-serif text-xl font-medium leading-[32px] sm:min-h-14">
                  Use your own knowledge to research
                </h4>
                <p className="font-sans text-lg font-medium leading-[30px] text-muted-foreground">
                  With Projects, add any context, create reusable knowledge
                  bases and query repeatedly for tailored responses.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="min-w-0 shrink-0 grow-0 basis-full md:basis-[45%] lg:basis-[28%] flex justify-center p-0"
          >
            <div className="flex w-[326px] flex-col gap-4">
              <div className="relative h-[366px] w-full overflow-hidden rounded-lg">
                <Image
                  src="https://cdn.getmerlin.in/cms/infog_a09cbff947.webp"
                  alt="Infographics"
                  fill
                  className="rounded-lg object-cover transition-opacity duration-300 ease-in-out opacity-100 group-hover:opacity-90"
                />
              </div>
              <div className="flex flex-col gap-1 z-10">
                <h4 className="text-foreground font-serif text-xl font-medium leading-[32px] sm:min-h-14">
                  Turn words into infographics
                </h4>
                <p className="font-sans text-lg font-medium leading-[30px] text-muted-foreground">
                  With Crafts, generate a variety of diagrams and interactive
                  charts with just a prompt.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="min-w-0 shrink-0 grow-0 basis-full md:basis-[45%] lg:basis-[28%] flex justify-center p-0"
          >
            <div className="flex w-[326px] flex-col gap-4">
              <div className="relative h-[366px] w-full overflow-hidden rounded-lg">
                <Image
                  src="https://cdn.getmerlin.in/cms/appsnip_0edfd396f9.webp"
                  alt="App snippets"
                  fill
                  className="rounded-lg object-cover transition-opacity duration-300 ease-in-out opacity-100 group-hover:opacity-90"
                />
              </div>
              <div className="flex flex-col gap-1 z-10">
                <h4 className="text-foreground font-serif text-xl font-medium leading-[32px] sm:min-h-14">
                  Create working app snippets
                </h4>
                <p className="font-sans text-lg font-medium leading-[30px] text-muted-foreground">
                  Prototype rapidly with React and Shadcn based app snippets and
                  edit code on the fly.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="min-w-0 shrink-0 grow-0 basis-full md:basis-[45%] lg:basis-[28%] flex justify-center p-0"
          >
            <div className="flex w-[326px] flex-col gap-4">
              <div className="relative h-[366px] w-full overflow-hidden rounded-lg">
                <Image
                  src="https://cdn.getmerlin.in/cms/o1_cfad888c7c.webp"
                  alt="o1 model"
                  fill
                  className="rounded-lg object-cover transition-opacity duration-300 ease-in-out opacity-100 group-hover:opacity-90"
                />
              </div>
              <div className="flex flex-col gap-1 z-10">
                <h4 className="text-foreground font-serif text-xl font-medium leading-[32px] sm:min-h-14">
                  Use OpenAI o1 with realtime web
                </h4>
                <p className="font-sans text-lg font-medium leading-[30px] text-muted-foreground">
                  Use chain-of-thought reasoning with realtime web sources to
                  get a powerful research machine in your hands
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
