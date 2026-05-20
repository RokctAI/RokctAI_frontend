"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiLoader, FiExternalLink } from "react-icons/fi";
import { OpportunityPublicService, Opportunity } from "@/app/services/public/opportunities";
import { Badge } from "@/components/ui/badge";

const WORDS = [
  { text: "Everything", verb: "is" },
  { text: "Knowledge", verb: "is" },
  { text: "Research", verb: "is" },
  { text: "Summaries", verb: "are" },
  { text: "PDFs", verb: "are" }
];

interface SearchResults {
  tenders: Opportunity[];
  grants: Opportunity[];
  equity: Opportunity[];
}

export function Hero({
  signupUrl = "/register",
  id,
}: {
  signupUrl?: string;
  id?: string;
}) {
  const [index, setIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSearchedQuery, setLastSearchedQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setLastSearchedQuery(searchQuery);
    try {
      const data = await OpportunityPublicService.search(searchQuery);
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
      setResults({ tenders: [], grants: [], equity: [] });
    } finally {
      setLoading(false);
    }
  };

  const allResults = useMemo(() => {
    if (!results) return [];
    return [
      ...results.tenders.map(t => ({ ...t, type: 'Tender' })),
      ...results.grants.map(g => ({ ...g, type: 'Grant' })),
      ...results.equity.map(e => ({ ...e, type: 'Equity' }))
    ];
  }, [results]);

  const getOpportunityPath = (type: string) => {
    switch (type.toLowerCase()) {
      case 'tender': return 'tenders';
      case 'grant': return 'grants';
      case 'equity': return 'equity';
      default: return 'opportunities';
    }
  };

  return (
    <section id={id} className="relative w-full overflow-hidden bg-white dark:bg-[#0a0a0a] pt-6 md:pt-8 pb-10">
      {/* Background Vector */}
      <div className="absolute inset-0 z-0 opacity-10 dark:opacity-30">
        <Image
          src="https://cdn.getmerlin.in/cms/Gradient_Animation_2_a3db99fe6f.png"
          alt="background"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">

        {/* Top Graphics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-6"
        >
          <div className="flex items-center justify-center -space-x-10 scale-[0.4] md:scale-[0.55] lg:scale-[0.65]">
             <div className="relative z-0 transform -rotate-6 translate-y-4">
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl p-1 overflow-hidden w-24 h-16 md:w-36 md:h-24">
                  <Image
                    src="https://cdn.getmerlin.in/cms/Chrome_Web_Store_icon_5e2d8a5a4f.svg"
                    alt="Browser"
                    width={140}
                    height={100}
                    className="opacity-20 mt-2 mx-auto"
                  />
                </div>
             </div>
             <div className="relative z-20">
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl p-1 overflow-hidden w-24 h-32 md:w-36 md:h-48">
                   <div className="p-3 space-y-1.5">
                     <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded" />
                     <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded" />
                     <div className="h-1.5 w-3/4 bg-gray-100 dark:bg-zinc-800 rounded" />
                     <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded" />
                     <div className="h-1.5 w-5/6 bg-gray-100 dark:bg-zinc-800 rounded" />
                     <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded" />
                     <div className="h-1.5 w-2/3 bg-gray-100 dark:bg-zinc-800 rounded" />
                   </div>
                </div>
             </div>
             <div className="relative z-10 transform rotate-6 translate-y-4">
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl p-1 overflow-hidden w-24 h-16 md:w-36 md:h-24">
                  <Image
                    src="https://cdn.getmerlin.in/cms/Frame_1321318057_c8c5638b09.webp"
                    alt="Photo"
                    width={140}
                    height={100}
                    className="object-cover h-full w-full"
                  />
                </div>
             </div>
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/5 h-1 bg-zinc-400/20 dark:bg-white/10 blur-sm rounded-full" />
        </motion.div>

        {/* Main Headline */}
        <div className="mb-6 h-[1.2em] flex items-center justify-center">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight flex flex-wrap items-center justify-center gap-x-3"
            >
                <div className="relative inline-flex items-center min-w-[140px] md:min-w-[260px] justify-center">
                    <AnimatePresence mode="wait">
                    <motion.span
                        key={WORDS[index].text}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="font-serif italic font-medium"
                    >
                        {WORDS[index].text}
                    </motion.span>
                    </AnimatePresence>
                </div>
                <div className="flex items-center gap-4">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={WORDS[index].verb}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {WORDS[index].verb}
                        </motion.span>
                    </AnimatePresence>
                    <span>a chat away</span>
                </div>
            </motion.h1>
        </div>

        {/* Search-style CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full max-w-xl px-4"
        >
          <form onSubmit={handleSearch} className="relative flex items-center p-[1px] bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-indigo-500/30 rounded-[24px] group focus-within:from-purple-500 focus-within:to-indigo-500 transition-all shadow-[0_0_40px_rgba(139,92,246,0.12)]">
            <div className="flex items-center w-full bg-white dark:bg-black rounded-[23px] p-1">
                <div className="pl-5 text-purple-400">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                        <path d="M12 2L14.5 9L22 11.5L14.5 14L12 21L9.5 14L2 11.5L9.5 9L12 2Z" />
                    </svg>
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for opportunities (Tenders, Grants, Equity)..."
                    className="w-full bg-transparent border-none focus:ring-0 px-5 py-3 text-base md:text-lg text-zinc-900 dark:text-white placeholder-gray-500 font-medium"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="mr-1.5 p-3 bg-zinc-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-300 rounded-[20px] hover:text-zinc-900 dark:hover:text-white transition-all hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 disabled:opacity-50"
                >
                    {loading ? <FiLoader className="animate-spin" size={20} /> : <FiSend size={20} />}
                </button>
            </div>
          </form>

          {/* Search Results */}
          <AnimatePresence>
            {(loading || hasSearched) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden text-left"
              >
                <div className="max-h-[400px] overflow-y-auto p-4 space-y-6">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                      <FiLoader className="w-8 h-8 animate-spin text-purple-500" />
                      <p className="text-zinc-500 dark:text-zinc-400 animate-pulse">Searching for opportunities...</p>
                    </div>
                  ) : allResults.length > 0 ? (
                    allResults.map((result, idx) => (
                      <div key={idx} className="group flex flex-col space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            rokct.ai › {getOpportunityPath(result.type)} › {result.slug}
                          </span>
                        </div>
                        <Link
                          href={`/opportunities/${getOpportunityPath(result.type)}/${result.slug}`}
                          className="text-xl text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-2"
                        >
                          {result.title}
                          <FiExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800">
                            {result.type}
                          </Badge>
                          {result.institution && (
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                              {result.institution}
                            </span>
                          )}
                          {(result.closing_date || result.deadline) && (
                            <span className="text-sm text-zinc-500 dark:text-zinc-500 flex items-center gap-1">
                              • Ends: {result.closing_date || result.deadline}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-1">
                          Explore this {result.type.toLowerCase()} opportunity from {result.institution || 'the organization'}.
                          {result.category ? ` Category: ${result.category}.` : ''}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center">
                      <p className="text-zinc-500 dark:text-zinc-400">No results found for &quot;{lastSearchedQuery}&quot;</p>
                      <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Try searching for something else like &quot;solar&quot; or &quot;education&quot;</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Social Proof & Platform badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 flex flex-col items-center gap-6"
        >
          <div className="flex items-center gap-4 text-zinc-900 dark:text-white text-base md:text-lg font-semibold opacity-80">
             <span>Trusted by 20M+ users</span>
             <div className="w-[1px] h-6 bg-zinc-200 dark:bg-white/20" />
             <span>Install on all platforms</span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4">
            <Link
              href="#"
              className="flex items-center gap-3 bg-white dark:bg-zinc-900 text-black dark:text-white px-6 py-3 rounded-xl hover:scale-105 transition-all shadow-md border border-zinc-100 dark:border-zinc-800 active:scale-95"
            >
              <Image
                src="https://cdn.getmerlin.in/cms/Chrome_Web_Store_icon_5e2d8a5a4f.svg"
                alt="Chrome"
                width={24}
                height={24}
              />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] uppercase font-bold text-gray-500 mb-0.5">Available in the</span>
                <span className="text-base font-bold">Chrome Web Store</span>
              </div>
            </Link>

            <Link
              href="#"
              className="flex items-center gap-3 bg-white dark:bg-zinc-900 text-black dark:text-white px-6 py-3 rounded-xl hover:scale-105 transition-all shadow-md border border-zinc-100 dark:border-zinc-800 active:scale-95"
            >
              <Image
                src="https://cdn.getmerlin.in/cms/Google_Play_logo_64f9907f74.svg"
                alt="Google Play"
                width={24}
                height={24}
              />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] uppercase font-bold text-gray-500 mb-0.5">GET IT ON</span>
                <span className="text-base font-bold">Google Play</span>
              </div>
            </Link>

            <Link
              href="#"
              className="flex items-center gap-3 bg-white dark:bg-zinc-900 text-black dark:text-white px-6 py-3 rounded-xl hover:scale-105 transition-all shadow-md border border-zinc-100 dark:border-zinc-800 active:scale-95"
            >
              <svg viewBox="0 0 384 512" fill="currentColor" className="w-7 h-7">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-31.4-73.3-114.8-1.7-152zM219 114.4c15.7-20 26.2-47.6 23.3-75.1-23.3 1-51.2 15.5-67.9 35.1-14.9 17.5-27.1 46-24.2 72.3 25.4 2 51.1-12.3 68.8-32.3z" />
              </svg>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] uppercase font-bold text-gray-500 mb-0.5">Download on the</span>
                <span className="text-base font-bold">App Store</span>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
