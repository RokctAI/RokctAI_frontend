"use client";
 
import { PLATFORM_NAME } from "@/app/config/platform";
import React, { useState } from "react";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const WORKFLOWS = [
  {
    id: "students",
    title: "Students",
    problem: "Overwhelmed by long lectures, complex research papers, and the struggle to maintain academic integrity while using AI.",
    solution: "Your academic superpower",
    points: [
      `Summarize long lecture documents and videos into powerful learning aids with ${PLATFORM_NAME} Extension`,
      `Create course bots for homework help and research with perfect citations using ${PLATFORM_NAME} Projects`,
      `Use ${PLATFORM_NAME} Tools for AI detection and humanising your submissions`
    ],
    icon: "🎓"
  },
  {
    id: "marketers",
    title: "Marketers & Creators",
    problem: "Struggling to maintain brand voice across multiple channels and spending hours on repetitive content creation.",
    solution: "Scale your creativity",
    points: [
      `Use ${PLATFORM_NAME} Projects to create knowledge bases that can be used for brand voice and content generation`,
      "Repurpose any kind of content on the web into SEO-friendly blogs, articles and copywriting",
      `Write contextualised cold outreach mails and messages on X, LinkedIn and Gmail using ${PLATFORM_NAME} Extension`
    ],
    icon: "🚀"
  },
  {
    id: "entrepreneurs",
    title: "Entrepreneurs",
    problem: "Fragmented focus and the constant need to switch tabs between AI tools, research, and communication.",
    solution: "10x your productivity",
    points: [
      "Maintain your flow state on the web by avoiding switching tabs for AI",
      `Use ${PLATFORM_NAME} Crafts to create mindmaps, graphs and 20+ diagrams to brainstorm like a pro`,
      `Get on top of communication and outreach woes with ${PLATFORM_NAME} on Gmail, X and LinkedIn`
    ],
    icon: "💼"
  },
  {
    id: "developers",
    title: "Developers",
    problem: "Fighting with boilerplate code and spending too much time reading documentation without a way to query it.",
    solution: "Code at the speed of thought",
    points: [
      `Use ${PLATFORM_NAME} Projects to add your codebase documentation to ${PLATFORM_NAME}'s knowledge`,
      `Use ${PLATFORM_NAME} Crafts to create web components, write and debug code with just a prompt`,
      `Select anything on the web and summon ${PLATFORM_NAME} for added context on-the-fly`
    ],
    icon: "💻"
  },
  {
    id: "consultants",
    title: "Consultants & PMs",
    problem: "The challenge of synthesizing real-time data from multiple sources into professional, visual presentations.",
    solution: "Insight-driven delivery",
    points: [
      "Use Live Search in tandem with websites and document sources to write precise, up-to-date reports",
      `Create ${PLATFORM_NAME} Projects with your research resources and chat with it for quick retrieval of information`,
      `Visualise with 20+ diagram types with just a prompt using ${PLATFORM_NAME} Crafts`
    ],
    icon: "📊"
  },
  {
    id: "analysts",
    title: "Analysts",
    problem: "Manual data cleaning and the friction of writing complex queries across different database clients.",
    solution: "Data analysis simplified",
    points: [
      `Use ${PLATFORM_NAME} Extension on Google Sheets or your DB client to write queries on-the-fly`,
      `Upload XLS/CSV files into ${PLATFORM_NAME} and ask for quick insights from the data`,
      `Use data as context and visualise with 20+ diagram types using ${PLATFORM_NAME} Crafts`
    ],
    icon: "📈"
  }
];

export function WorkflowSection({ id }: { id?: string }) {
  const [activeTab, setActiveTab] = useState(WORKFLOWS[0].id);
  const activeWorkflow = WORKFLOWS.find(w => w.id === activeTab)!;

  return (
    <section id={id} className="container flex w-full flex-col gap-12 py-12 md:py-24 bg-white dark:bg-black mx-auto">
      <div className="flex w-full flex-col items-center justify-center gap-6 px-4 text-center">
          <h2 className="text-[32px] font-black leading-[1.2] text-zinc-900 dark:text-white md:text-[64px] md:leading-[1.1] tracking-tighter">
             Your workflow, our magic
          </h2>
          <p className="text-xl font-medium text-zinc-500 dark:text-zinc-400 max-w-2xl">
             Whether you're a student, marketer, tech pro or even a founder, {PLATFORM_NAME} can make your life much easier at work.
          </p>
          <Link href="/chat" className="text-[#4F46E5] font-bold hover:underline flex items-center gap-2 group">
             See how {PLATFORM_NAME} fits your workflow 
             <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
      </div>

      <div className="flex w-full max-w-6xl flex-col gap-12 px-4 xl:px-0 mx-auto mt-12">
          {/* Persona Selector - Segmented Control Style */}
          <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl max-w-fit mx-auto w-full md:w-auto">
             {WORKFLOWS.map((workflow) => (
                <button
                   key={workflow.id}
                   onClick={() => setActiveTab(workflow.id)}
                   className={`px-5 py-2.5 rounded-xl text-sm md:text-base font-bold transition-all duration-300 ${
                      activeTab === workflow.id
                      ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm scale-100'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                   }`}
                >
                   {workflow.title}
                </button>
             ))}
          </div>

          {/* Workflow Display */}
          <div className="relative w-full rounded-[40px] bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-8 md:p-16 overflow-hidden">
             <AnimatePresence mode="wait">
                <motion.div
                   key={activeTab}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.3 }}
                   className="flex flex-col lg:flex-row gap-16 items-start"
                >
                   {/* Problem Section */}
                   <div className="w-full lg:w-1/2 flex flex-col gap-6">
                      <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest text-xs">
                         <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                         The Challenge
                      </div>
                      <h3 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white leading-tight">
                         {activeWorkflow.problem}
                      </h3>
                      <div className="hidden lg:flex items-center justify-end h-full opacity-20">
                         <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
                      </div>
                   </div>

                   {/* Solution Section */}
                   <div className="w-full lg:w-1/2 flex flex-col gap-8">
                      <div className="flex items-center gap-2 text-[#4F46E5] font-bold uppercase tracking-widest text-xs">
                         <span className="w-2 h-2 rounded-full bg-[#4F46E5]"></span>
                         The {PLATFORM_NAME} Solution
                      </div>
                      
                      <div className="space-y-8">
                         <h3 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white leading-tight">
                            {activeWorkflow.solution}
                         </h3>
                         
                         <ul className="grid grid-cols-1 gap-6">
                            {activeWorkflow.points.map((point, idx) => (
                               <motion.li 
                                  key={idx} 
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 * (idx + 1) }}
                                  className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-[#4F46E5] transition-colors group"
                               >
                                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[#4F46E5] text-xs font-bold mt-1">
                                     {idx + 1}
                                  </div>
                                  <span className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                     {point}
                                  </span>
                               </motion.li>
                            ))}
                         </ul>
                      </div>
                   </div>
                </motion.div>
             </AnimatePresence>
          </div>
      </div>
    </section>
  );
}

