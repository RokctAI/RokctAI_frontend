"use client";

import React, { useState } from "react";
import { PLATFORM_NAME } from "@/app/config/platform";
import { motion, AnimatePresence } from "framer-motion";

// Simple custom icons instead of missing lucide-react ones
const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);

const MinusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/></svg>
);

const FAQS = [
  {
    question: `What is ${PLATFORM_NAME} AI?`,
    answer: `${PLATFORM_NAME} is an AI Chrome Extension and web app that works as your AI-powered assistant, saving you time and money. It provides top AI models such as ChatGPT, GPT 4 , Claude, Deepseek V3, Opus, Llama, Mistral etc. to generate AI responses on Google Search, summaries for YouTube videos, blogs, documents (PDF or PPT), social media posts and replies to comments on LinkedIn, Twitter and Gmail. ${PLATFORM_NAME} also translates into more than twenty-five languages.`
  },
  {
    question: `How does ${PLATFORM_NAME} AI Chrome Extension work?`,
    answer: `Once installed as a Chrome Extension on the browser, you can open ${PLATFORM_NAME} AI Chatbot on any website using the shortcut: Ctrl/âŒ˜+M. On specific websites such as Twitter (now X), LinkedIn, YouTube and Gmail, you would find ${PLATFORM_NAME} buttons for easy access.`
  },
  {
    question: `What is the difference between ${PLATFORM_NAME} Teams and ${PLATFORM_NAME} Pro plans?`,
    answer: `On ${PLATFORM_NAME} Teams, you can buy a plan for your team of 5 or above and pay per team member. This means teams can save costs by distributing costs across users. Whereas ${PLATFORM_NAME} Pro plans are ideal for individual users who prefer unlimited queries and donâ€™t want to be limited in their daily use.`
  },
  {
    question: `Is ${PLATFORM_NAME} AI free to use?`,
    answer: `Yes, ${PLATFORM_NAME} AI is FREE and safe to use. All free users get 102 free queries credited to their account everyday. These queries can be used by the user to run multiple AI models such as GPT 3.5, GPT 4, Claude , Opus, Mistral, Gemini etc. ${PLATFORM_NAME} consume 30 queries when user ask ${PLATFORM_NAME} anything using GPT 4, Gemini 1.5, Mistral large model whereas GPT 3.5, Gemini, Claude 3 Haiku etc. model consume only 1 query.`
  },
  {
    question: "Do I need ChatGPT or Claude or Gemini or Llama account?",
    answer: `No, you will not need separate accounts to use top AI models such as ChatGPT or Claude or Mistral or Llama. You can create a free account at get${PLATFORM_NAME}.in and get access to all top models through a single account.`
  },
  {
    question: `Which search engine is supported by ${PLATFORM_NAME}?`,
    answer: `${PLATFORM_NAME} currently supports Google, Baidu, Bing, DuckDuckGo, Yahoo, and Yandex.`
  },
  {
    question: `How do I install ${PLATFORM_NAME} in my browser?`,
    answer: `To install ${PLATFORM_NAME} on your browser, you will need to follow these steps: 1. In your browser open the browser's app store or Google Chrome store 2. Search for the ${PLATFORM_NAME} extension in the chrome store 3. Click on the 'Add to Browser' or 'Install' button to begin the installation process. 4. Once the installation is complete, you will be redirected to our onboarding page 5. Thatâ€™s it! viola! You are done :) . Please pin the extension for easy access.`
  },
  {
    question: `What counts as a query in ${PLATFORM_NAME} search?`,
    answer: `When you ask ${PLATFORM_NAME} anything and click enter that's called one query. If you are on the search engine like Google, ${PLATFORM_NAME} gives response automatically and that does not count as a query, ${PLATFORM_NAME} provides FREE searches on Google.`
  },
  {
    question: "How do I keep a track of my free queries?",
    answer: `When you open ${PLATFORM_NAME} using Ctrl/âŒ˜+M, you will see your count of queries on the top left corner.`
  },
  {
    question: `Why ${PLATFORM_NAME} is not opening after installation?`,
    answer: `Refresh only the tabs that were already open before installing ${PLATFORM_NAME}. But for the new tabs that you open here after installing of ${PLATFORM_NAME} there no need to refresh. But as a good practice please do refresh if ${PLATFORM_NAME} doesn't come up or certain things are amiss!`
  }
];

export function FaqSection({ id }: { id?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id={id} className="container flex w-full flex-col gap-12 py-24 bg-white dark:bg-black mx-auto">
      <div className="flex w-full flex-col items-center justify-center gap-6 px-4 text-center">
         <h2 className="text-[32px] font-black leading-[1.2] text-zinc-900 dark:text-white md:text-[56px] md:leading-[1.1]">
            Want to know more?
         </h2>
          <p className="text-xl font-medium text-zinc-500 dark:text-zinc-400 max-w-2xl">
             Here’s a list of FAQs to help you get started!
          </p>
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 xl:px-0 mt-8">
        <div className="flex flex-col gap-4">
          {FAQS.map((faq, index) => (
            <div
               key={index}
               className={`border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'bg-zinc-50 dark:bg-zinc-900' : 'bg-transparent'
               }`}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <span className="text-xl font-bold text-zinc-900 dark:text-white pr-8">
                  {faq.question}
                </span>
                <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  {openIndex === index ? <MinusIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                </span>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-200 dark:border-zinc-800/50 mt-2">
                      <p className="pt-4">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

