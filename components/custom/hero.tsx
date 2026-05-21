"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiLoader, FiExternalLink, FiX, FiFilter, FiChevronDown, FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import { OpportunityPublicService, Opportunity } from "@/app/services/public/opportunities";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "./brand-logo";
import { Branding } from "./branding";
import { PLATFORM_NAME } from "@/app/config/platform";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const WORDS = [
  { text: "Everything", verb: "is" },
  { text: "Funding", verb: "is" },
  { text: "Research", verb: "is" },
  { text: "Grants", verb: "are" },
  { text: "Tenders", verb: "are" }
];

const SEARCH_PLACEHOLDERS = [
  "search...",
  "talk to Rokct"
];

interface SearchResults {
  tenders: Opportunity[];
  grants: Opportunity[];
  equity: Opportunity[];
}

type FilterType = "All" | "Tenders" | "Grants" | "Equity" | "Chat";

function TypewriterPlaceholder({
  placeholders,
  isSearching,
  isFocused,
  onPlaceholderChange
}: {
  placeholders: string[],
  isSearching: boolean,
  isFocused: boolean,
  onPlaceholderChange?: (index: number) => void
}) {
  const [currentText, setCurrentText] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isFading, setIsFading] = useState(false);
  useEffect(() => {
    if (isSearching || isFocused) return;

    if (isFading) {
      const timeout = setTimeout(() => {
        setIsFading(false);
        setCurrentText("");
        const nextIndex = (placeholderIndex + 1) % placeholders.length;
        setPlaceholderIndex(nextIndex);
        onPlaceholderChange?.(nextIndex);
        setIsTyping(true);
      }, 500); // Fade duration
      return () => clearTimeout(timeout);
    }

    if (isTyping) {
      const fullText = placeholders[placeholderIndex];
      if (currentText.length < fullText.length) {
        const timeout = setTimeout(() => {
          setCurrentText(fullText.substring(0, currentText.length + 1));
        }, 150);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false);
          setIsFading(true);
        }, 2000); // Wait before fade
        return () => clearTimeout(timeout);
      }
    }
  }, [currentText, isTyping, isFading, placeholderIndex, placeholders, isSearching, isFocused]);

  if (isSearching || isFocused) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${placeholderIndex}-${isFading}`}
        initial={{ opacity: 1 }}
        animate={{ opacity: isFading ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 flex items-center px-5 pointer-events-none text-gray-500 font-medium whitespace-nowrap"
      >
        {currentText}
        {isTyping && <span className="w-[1.5px] h-5 bg-purple-500 ml-0.5 animate-pulse" />}
      </motion.div>
    </AnimatePresence>
  );
}

export function Hero({
  signupUrl = "/register",
  id,
}: {
  signupUrl?: string;
  id?: string;
}) {
  const [index, setIndex] = useState(0);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSearchedQuery, setLastSearchedQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [isFocused, setIsFocused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const branding = mounted && typeof window !== "undefined" 
    ? JSON.parse(localStorage.getItem("rokct_branding_data") || "null") 
    : null;

  // Collapse hero logo/text when user is actively using the search
  const isExpanded = isFocused || hasSearched;

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Clear results if search query is erased
  useEffect(() => {
    if (searchQuery === "") {
      setResults(null);
      setHasSearched(false);
      setLastSearchedQuery("");
      setActiveFilter("All");
    }
  }, [searchQuery]);

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

  const clearResults = () => {
    setResults(null);
    setHasSearched(false);
    setLastSearchedQuery("");
    setSearchQuery("");
    setActiveFilter("All");
  };

  const handleFilterChange = (filter: FilterType) => {
    if (filter === "Chat") {
      clearResults();
    } else {
      setActiveFilter(filter);
    }
  };

  const filteredResults = useMemo(() => {
    if (!results || activeFilter === "Chat") return [];

    const all = [
      ...results.tenders.map(t => ({ ...t, type: 'Tender' })),
      ...results.grants.map(g => ({ ...g, type: 'Grant' })),
      ...results.equity.map(e => ({ ...e, type: 'Equity' }))
    ];

    if (activeFilter === "All") return all;
    return all.filter(r => r.type === activeFilter.slice(0, -1) || r.type === activeFilter);
  }, [results, activeFilter]);

  const getOpportunityPath = (type: string) => {
    switch (type.toLowerCase()) {
      case 'tender': return 'tenders';
      case 'grant': return 'grants';
      case 'equity': return 'equity';
      default: return 'opportunities';
    }
  };

  return (
    <section id={id} className="relative w-full overflow-hidden bg-white dark:bg-[#0a0a0a] pt-16 pb-10">
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

        {/* Top Graphics & Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-8 mt-4 md:mt-12 flex flex-col items-center justify-center"
        >
          <div className="flex flex-row items-center justify-center h-[72px]">
            <div className="relative flex items-center h-[56px]">
              <BrandLogo width={56} height={56} showBadge={true} />
              {/* Country code appears next to logo only when text is collapsed */}
              <div
                className="transition-all duration-500 overflow-hidden"
                style={{
                  opacity: isExpanded && branding?.code ? 1 : 0,
                  width: isExpanded && branding?.code ? '28px' : '0px',
                  height: '56px',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    paddingTop: '3px',
                    fontSize: '16px',
                    fontWeight: 500,
                    marginLeft: '6px',
                    color: 'inherit',
                  }}
                >
                  {branding?.code}
                </span>
              </div>
            </div>
            <div
              className="overflow-hidden transition-all duration-500 ease-in-out flex items-center h-[56px]"
              style={{ width: isExpanded ? '0px' : '150px', opacity: isExpanded ? 0 : 1 }}
            >
              <div className="pl-3 flex items-center h-full pt-1">
                <Branding 
                  showBadge={false} 
                  className="text-[56px] tracking-tighter leading-none" 
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Headline */}
        <div className="mb-6 h-[1.2em] flex items-center justify-center">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight flex flex-wrap items-center justify-center gap-x-3"
            >
                <div className="relative inline-flex items-center justify-center">
                    <AnimatePresence mode="wait">
                    <motion.span
                        key={WORDS[index].text}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="font-serif italic font-bold"
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
          className="w-full max-w-3xl px-4"
        >
          <form onSubmit={handleSearch} className="relative flex items-center p-[1px] bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-indigo-500/30 rounded-[24px] group focus-within:from-purple-500 focus-within:to-indigo-500 transition-all shadow-[0_0_40px_rgba(139,92,246,0.12)]">
            <div className="flex items-center w-full bg-white dark:bg-black rounded-[23px] p-1">
                <div className="pl-3 flex items-center text-zinc-400 dark:text-zinc-500">
                    {(!searchQuery && !isFocused && SEARCH_PLACEHOLDERS[placeholderIndex]?.toLowerCase().includes("rokct")) ? (
                      <BrandLogo width={20} height={20} variant="auto" showBadge={false} className="!rounded-full" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    )}
                </div>
                <div className="relative w-full overflow-hidden">
                  <TypewriterPlaceholder
                    placeholders={SEARCH_PLACEHOLDERS}
                    isSearching={!!searchQuery}
                    isFocused={isFocused}
                    onPlaceholderChange={setPlaceholderIndex}
                  />
                  <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder=""
                      className="w-full bg-transparent border-none outline-none focus:ring-0 focus:outline-none px-5 py-3 text-base md:text-lg text-zinc-900 dark:text-white placeholder-transparent font-medium relative z-10"
                  />
                </div>

                {hasSearched && !loading ? (
                  <div className="flex items-center mr-1.5 gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-1 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-[20px] hover:text-zinc-900 dark:hover:text-white transition-all text-sm font-medium border border-zinc-200 dark:border-zinc-700">
                          {activeFilter} <FiChevronDown size={14} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                        {(["All", "Tenders", "Grants", "Equity", "Chat"] as FilterType[]).map((filter) => (
                          <DropdownMenuItem
                            key={filter}
                            onClick={() => handleFilterChange(filter)}
                            className="rounded-lg cursor-pointer focus:bg-zinc-100 dark:focus:bg-zinc-800"
                          >
                            {filter}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <button
                      type="submit"
                      disabled={loading}
                      className={`mr-1.5 p-3 rounded-[20px] transition-all active:scale-95 disabled:opacity-50 ${
                        searchQuery.trim().length > 0
                          ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                  >
                      {loading ? <FiLoader className="animate-spin" size={20} /> : (searchQuery.trim().length > 0 ? <FiArrowRight size={20} strokeWidth={2.5} /> : <FiArrowUpRight size={20} />)}
                  </button>
                )}
            </div>
          </form>

          {/* Search Results */}
          <AnimatePresence>
            {(loading || hasSearched) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden text-left relative"
              >
                {!loading && (
                  <button
                    onClick={clearResults}
                    className="absolute top-4 right-4 p-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors z-20"
                    aria-label="Close results"
                  >
                    <FiX size={18} />
                  </button>
                )}

                <div className="max-h-[400px] overflow-y-auto p-4 space-y-6">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                      <FiLoader className="w-8 h-8 animate-spin text-purple-500" />
                      <p className="text-zinc-500 dark:text-zinc-400 animate-pulse">Searching for opportunities...</p>
                    </div>
                  ) : filteredResults.length > 0 ? (
                    filteredResults.map((result, idx) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={`${result.type}-${result.slug}-${idx}`}
                        className="group flex flex-col space-y-1 pr-8"
                      >
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
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-10 text-center pr-8">
                      <p className="text-zinc-500 dark:text-zinc-400">No {activeFilter !== "All" ? activeFilter.toLowerCase() : ""} results found for &quot;{lastSearchedQuery}&quot;</p>
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
