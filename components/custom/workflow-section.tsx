/*
 * Copyright (c) 2026 RokctAI
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

import { PLATFORM_NAME } from "@/app/config/platform";
import React from "react";
import Link from "next/link";
import {
  ChevronRight,
  GraduationCap,
  Megaphone,
  Briefcase,
  Code,
  ClipboardList,
  ChartLine,
  Pointer,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

const WORKFLOWS = [
  {
    id: "students",
    title: "Students",
    icon: GraduationCap,
    bgColor: "bg-blue-700",
    query:
      "How do I nail my research assignments, ace my exams and learn effectively?",
    solutions: [
      `Summarize long lecture documents and videos into powerful learning aids with ${PLATFORM_NAME} Extension`,
      `Create course bots for homework help and research with perfect citations using ${PLATFORM_NAME} Projects`,
      `Use ${PLATFORM_NAME} Tools for AI detection and humanising your submissions`,
    ],
  },
  {
    id: "marketers",
    title: "Marketers and creators",
    icon: Megaphone,
    bgColor: "bg-indigo-700",
    query:
      "How do I generate creative, SEO-friendly collateral suited to my brand voice over-and-over, effortlessly?",
    solutions: [
      `Use ${PLATFORM_NAME} Projects to create knowledge bases that can be used for brand voice and content generation`,
      "Repurpose any kind of content on the web into SEO-friendly blogs, articles and copywriting",
      `Write contextualised cold outreach mails and messages on X, LinkedIn and Gmail using ${PLATFORM_NAME} Extension`,
    ],
  },
  {
    id: "entrepreneurs",
    title: "Entrepreneurs",
    icon: Briefcase,
    bgColor: "bg-violet-700",
    query:
      "How do I brainstorm ideas effectively, communicate like a boss and 10x my productivity at work?",
    solutions: [
      "Maintain your flow state on the web by avoiding switching tabs for AI",
      `Use ${PLATFORM_NAME} Crafts to create mindmaps, graphs and 20+ diagrams to brainstorm like a pro`,
      `Get on top of communication and outreach woes with ${PLATFORM_NAME} on Gmail, X and LinkedIn`,
    ],
  },
  {
    id: "developers",
    title: "Developers",
    icon: Code,
    bgColor: "bg-purple-700",
    query:
      "How do I iterate on code effectively, debug with context and save time on creating boilerplate code components?",
    solutions: [
      `Use ${PLATFORM_NAME} Projects to add your codebase documentation to ${PLATFORM_NAME}'s knowledge`,
      `Use ${PLATFORM_NAME} Crafts to create web components, write and debug code with just a prompt`,
      `Select anything on the web and summon ${PLATFORM_NAME} for added context on-the-fly`,
    ],
  },
  {
    id: "consultants",
    title: "Consultants and PMs",
    icon: ClipboardList,
    bgColor: "bg-fuchsia-700",
    query:
      "How do I research in real-time, organise my research and visualise it effectively for presentations?",
    solutions: [
      "Use Live Search in tandem with websites and document sources to write precise, up-to-date reports",
      `Create ${PLATFORM_NAME} Projects with your research resources and chat with it for quick retrieval of information`,
      `Visualise with 20+ diagram types with just a prompt using ${PLATFORM_NAME} Crafts`,
    ],
  },
  {
    id: "analysts",
    title: "Analysts",
    icon: ChartLine,
    bgColor: "bg-blue-900",
    query:
      "How do I write accurate queries faster, analyse data without having to build dashboards and present my insights better?",
    solutions: [
      `Use ${PLATFORM_NAME} Extension on Google Sheets or your DB client to write queries on-the-fly`,
      `Upload XLS/CSV files into ${PLATFORM_NAME} and ask for quick insights from the data`,
      `Use data as context and visualise with 20+ diagram types using ${PLATFORM_NAME} Crafts`,
    ],
  },
];

export function WorkflowSection({ id }: { id?: string }) {
  return (
    <section
      id={id}
      className="container flex w-full flex-col gap-12 py-16 mx-auto bg-background"
    >
      <div className="flex w-full max-w-7xl flex-col gap-12 mx-auto">
        <div className="flex flex-col gap-9 px-4 xl:px-0">
          <div className="flex flex-col gap-4">
            <h2 className="text-foreground font-serif text-center text-3xl font-medium tracking-normal md:text-5xl">
              Your workflow, our magic
            </h2>
            <p className="font-sans text-center text-lg font-medium text-muted-foreground">
              Whether you're a student, marketer, tech pro or even a founder,{" "}
              {PLATFORM_NAME} can make your life much easier at work.
            </p>
          </div>
          <div className="mx-auto">
            <Link
              href="/chat"
              className="flex w-max items-center rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground shadow hover:bg-primary/90 group transition-all"
            >
              See how {PLATFORM_NAME} fits your workflow
              <ChevronRight className="ml-2 size-5" />
            </Link>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <Carousel
            opts={{
              align: "start",
              loop: false,
              dragFree: true,
            }}
            className="w-full relative"
          >
            <CarouselContent className="-ml-4 !-ml-0">
              {WORKFLOWS.map((workflow, index) => {
                const Icon = workflow.icon;
                return (
                  <CarouselItem
                    key={index}
                    className="min-w-0 shrink-0 grow-0 basis-full flex justify-center p-0 md:basis-1/2 lg:basis-[28%] pl-4"
                  >
                    <div className="group rounded-xl border bg-card text-card-foreground relative h-[441px] w-full max-w-[335px] overflow-hidden transition-all duration-300 ease-in-out shadow hover:shadow-lg">
                      <div className="space-y-1.5 p-6 absolute top-0 z-[1] flex w-full flex-row items-center gap-2 bg-card transition-all duration-500 ease-in-out">
                        <div
                          className={`${workflow.bgColor} flex items-center justify-center rounded-full p-2 transition-transform duration-300 ease-in-out`}
                        >
                          <Icon
                            className="size-5 text-white"
                            aria-hidden="true"
                          />
                        </div>
                        <h4 className="text-foreground font-sans !mt-0 text-base font-medium">
                          {workflow.title}
                        </h4>
                      </div>

                      <div className="p-6 z-0 flex h-full flex-col justify-between pt-[84px] transition-all duration-500 ease-in-out translate-y-0 opacity-100 group-hover:-translate-y-4 group-hover:opacity-0">
                        <p className="text-foreground font-serif font-light text-2xl leading-[38px] line-clamp-4">
                          {workflow.query}
                        </p>
                        <div className="items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground flex gap-2 w-max">
                          <Pointer className="size-3" aria-hidden="true" />
                          <p className="text-foreground font-sans font-light text-xs">
                            Hover to see how {PLATFORM_NAME} solves this
                          </p>
                        </div>
                      </div>

                      <div className="p-6 absolute inset-x-0 top-full flex h-full flex-col px-6 pt-[84px] text-lg leading-[28px] transition-all duration-500 ease-in-out translate-y-0 opacity-0 group-hover:-translate-y-full group-hover:opacity-100 bg-card overflow-y-auto">
                        <p className="text-foreground font-serif text-base font-light leading-6">
                          {workflow.solutions.map((point, idx) => (
                            <React.Fragment key={idx}>
                              • {point}
                              {idx < workflow.solutions.length - 1 && (
                                <>
                                  <br />
                                  <br />
                                </>
                              )}
                            </React.Fragment>
                          ))}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 size-12 shadow hover:bg-accent hover:text-accent-foreground hidden lg:flex" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 size-12 shadow hover:bg-accent hover:text-accent-foreground hidden lg:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
