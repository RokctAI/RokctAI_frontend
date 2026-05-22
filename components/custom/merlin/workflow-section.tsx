"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const WORKFLOWS = [
  {
    id: "students",
    title: "Students",
    question: "How do I nail my research assignments, ace my exams and learn effectively?",
    points: [
      "Summarize long lecture documents and videos into powerful learning aids with Merlin Extension",
      "Create course bots for homework help and research with perfect citations using Merlin Projects",
      "Use Merlin Tools for AI detection and humanising your submissions"
    ]
  },
  {
    id: "marketers",
    title: "Marketers and creators",
    question: "How do I generate creative, SEO-friendly collateral suited to my brand voice over-and-over, effortlessly?",
    points: [
      "Use Merlin Projects to create knowledge bases that can be used for brand voice and content generation",
      "Repurpose any kind of content on the web into SEO-friendly blogs, articles and copywriting",
      "Write contextualised cold outreach mails and messages on X, LinkedIn and Gmail using Merlin Extension"
    ]
  },
  {
    id: "entrepreneurs",
    title: "Entrepreneurs",
    question: "How do I brainstorm ideas effectively, communicate like a boss and 10x my productivity at work?",
    points: [
      "Maintain your flow state on the web by avoiding switching tabs for AI",
      "Use Merlin Crafts to create mindmaps, graphs and 20+ diagrams to brainstorm like a pro",
      "Get on top of communication and outreach woes with Merlin on Gmail, X and LinkedIn"
    ]
  },
  {
    id: "developers",
    title: "Developers",
    question: "How do I iterate on code effectively, debug with context and save time on creating boilerplate code components?",
    points: [
      "Use Merlin Projects to add your codebase documentation to Merlin's knowledge",
      "Use Merlin Crafts to create web components, write and debug code with just a prompt",
      "Select anything on the web and summon Merlin for added context on-the-fly"
    ]
  },
  {
    id: "consultants",
    title: "Consultants and PMs",
    question: "How do I research in real-time, organise my research and visualise it effectively for presentations?",
    points: [
      "Use Live Search in tandem with websites and document sources to write precise, up-to-date reports",
      "Create Merlin Projects with your research resources and chat with it for quick retrieval of information",
      "Visualise with 20+ diagram types with just a prompt using Merlin Crafts"
    ]
  },
  {
    id: "analysts",
    title: "Analysts",
    question: "How do I write accurate queries faster, analyse data without having to build dashboards and present my insights better?",
    points: [
      "Use Merlin Extension on Google Sheets or your DB client to write queries on-the-fly",
      "Upload XLS/CSV files into Merlin and ask for quick insights from the data",
      "Use data as context and visualise with 20+ diagram types using Merlin Crafts"
    ]
  }
];

export function WorkflowSection({ id }: { id?: string }) {
  const [activeTab, setActiveTab] = useState(WORKFLOWS[0].id);

  return (
    <section id={id} className="container flex w-full flex-col gap-12 py-24 bg-white dark:bg-black mx-auto">
      <div className="flex w-full flex-col items-center justify-center gap-6 px-4 text-center">
         <h2 className="text-[32px] font-black leading-[1.2] text-zinc-900 dark:text-white md:text-[56px] md:leading-[1.1]">
            Your workflow, our magic
         </h2>
         <p className="text-xl font-medium text-zinc-500 dark:text-zinc-400 max-w-2xl">
            Whether you're a student, marketer, tech pro or even a founder, Merlin can make your life much easier at work.
         </p>
         <Link href="/chat" className="text-[#4F46E5] font-bold hover:underline">
            See how Merlin fits your workflow &gt;
         </Link>
      </div>

      <div className="flex w-full max-w-7xl flex-col gap-8 px-4 xl:px-0 mx-auto mt-8">
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {WORKFLOWS.map((workflow) => (
               <button
                  key={workflow.id}
                  onClick={() => setActiveTab(workflow.id)}
                  className={`px-4 py-3 rounded-full text-sm md:text-base font-bold transition-all ${
                     activeTab === workflow.id
                     ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg'
                     : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
                  }`}
               >
                  {workflow.title}
               </button>
            ))}
         </div>

         <div className="mt-8 relative min-h-[400px] w-full rounded-[32px] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-8 md:p-16 overflow-hidden">
            <AnimatePresence mode="wait">
               {WORKFLOWS.map((workflow) => workflow.id === activeTab && (
                  <motion.div
                     key={workflow.id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -20 }}
                     transition={{ duration: 0.3 }}
                     className="flex flex-col md:flex-row items-center gap-12 w-full h-full"
                  >
                     <div className="w-full md:w-1/2 flex flex-col gap-6">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white dark:bg-black shadow-md">
                           <span className="text-2xl">🤔</span>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white leading-tight">
                           {workflow.question}
                        </h3>
                     </div>

                     <div className="hidden md:flex flex-col items-center justify-center opacity-30 px-8">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                     </div>

                     <div className="w-full md:w-1/2 flex flex-col gap-6 bg-white dark:bg-black p-8 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                           <span className="text-xl">✨</span>
                           <span className="font-bold text-zinc-900 dark:text-white">Hover to see how Merlin solves this</span>
                        </div>
                        <ul className="flex flex-col gap-4 mt-2">
                           {workflow.points.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                 <span className="text-[#4F46E5] font-bold mt-1">•</span>
                                 <span className="text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">{point}</span>
                              </li>
                           ))}
                        </ul>
                     </div>
                  </motion.div>
               ))}
            </AnimatePresence>
         </div>
      </div>
    </section>
  );
}
