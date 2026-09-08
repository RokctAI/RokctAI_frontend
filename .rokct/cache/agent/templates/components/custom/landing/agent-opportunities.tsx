/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

"use client";

// The agent SDK's contribution to the generic landing hero
// (base_sdk: components/custom/hero.tsx): the public opportunities search.
// Registered in components/custom/landing/hero-sections.ts by this SDK's
// manifest integration; the hero hands it the submitted query and renders
// it under the input. The intent pass and the tenders/grants/equity results
// panel that used to live inside the hero itself are here, untouched in
// behaviour; the type filter moved from the input bar into the panel header
// because the input now belongs to the hero. The search itself goes through
// the searchPublicOpportunities server action (app/actions/ai/
// opportunities.ts): the service behind it is server-only, so this client
// component only imports its Opportunity type.

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink, Loader2, X } from "lucide-react";

import { searchPublicOpportunities } from "@/app/actions/ai/opportunities";
import t from "@/app/lib/i18n";
import { analyzeIntent } from "@/app/lib/intent-engine";
import type { Opportunity } from "@/app/services/public/opportunities";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  HeroSectionMeta,
  HeroSectionProps,
} from "@/components/custom/landing/hero-sections";

/** Copy this section adds to the hero's headline rotation. */
export const meta: HeroSectionMeta = {
  headlineWords: [
    { text: "Funding", verb: "is" },
    { text: "Grants", verb: "are" },
    { text: "Tenders", verb: "are" },
  ],
};

interface SearchResults {
  tenders: Opportunity[];
  grants: Opportunity[];
  equity: Opportunity[];
}

type FilterType = "All" | "Tenders" | "Grants" | "Equity" | "Chat";

const EMPTY_RESULTS: SearchResults = { tenders: [], grants: [], equity: [] };

const LOADING_MESSAGES = [
  "Analyzing your request...",
  "Scanning opportunities...",
  "Applying AI filters...",
  "Finding best matches...",
];

// Filter out opportunities whose closing date / deadline has passed
function isExpired(item: Opportunity): boolean {
  const raw = item.closing_date || item.deadline;
  if (!raw) return false;

  let d: Date | null = null;
  const dmyRegex = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
  const match = raw.match(dmyRegex);

  if (match) {
    const [_, day, month, year] = match;
    d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  } else {
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) d = parsed;
  }

  if (!d) return false;
  return d < new Date();
}

function getOpportunityPath(type: string) {
  switch (type.toLowerCase()) {
    case "tender":
      return "tenders";
    case "grant":
      return "grants";
    case "equity":
      return "equity";
    default:
      return "opportunities";
  }
}

export default function AgentOpportunitiesSection({
  query,
  submitId,
  onActiveChange,
  onBusyChange,
  onClear,
}: HeroSectionProps) {
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchedQuery, setLastSearchedQuery] = useState("");
  const [unrelatedMode, setUnrelatedMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 1500);
      return () => clearInterval(interval);
    } else {
      setLoadingStep(0);
    }
  }, [loading]);

  useEffect(() => {
    onActiveChange(hasSearched);
  }, [hasSearched, onActiveChange]);

  useEffect(() => {
    onBusyChange(loading);
  }, [loading, onBusyChange]);

  // Run the hero's submitted query; an erased input withdraws it
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setHasSearched(false);
      setLastSearchedQuery("");
      setUnrelatedMode(false);
      setActiveFilter("All");
      return;
    }

    const { type, cleaned } = analyzeIntent(query);

    if (type === "greeting" || type === "vague") {
      setUnrelatedMode(false);
      setHasSearched(true);
      setResults(EMPTY_RESULTS);
      setLastSearchedQuery(query);
      return;
    }

    if (type === "unrelated") {
      setUnrelatedMode(true);
      setHasSearched(true);
      setResults(EMPTY_RESULTS);
      setLastSearchedQuery(query);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setUnrelatedMode(false);
    setHasSearched(true);
    setLastSearchedQuery(cleaned);
    searchPublicOpportunities(cleaned)
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .catch((error) => {
        console.error("Search failed:", error);
        if (!cancelled) setResults(EMPTY_RESULTS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, submitId]);

  const handleFilterChange = (filter: FilterType) => {
    if (filter === "Chat") {
      onClear();
    } else {
      setActiveFilter(filter);
    }
  };

  const filteredResults = useMemo(() => {
    if (!results || activeFilter === "Chat") return [];

    const all = [
      ...results.tenders
        .filter((item) => !isExpired(item))
        .map((item) => ({ ...item, type: "Tender" })),
      ...results.grants
        .filter((item) => !isExpired(item))
        .map((item) => ({ ...item, type: "Grant" })),
      ...results.equity
        .filter((item) => !isExpired(item))
        .map((item) => ({ ...item, type: "Equity" })),
    ];

    if (activeFilter === "All") return all;
    return all.filter(
      (r) => r.type === activeFilter.slice(0, -1) || r.type === activeFilter,
    );
  }, [results, activeFilter]);

  return (
    <AnimatePresence>
      {(loading || hasSearched) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="mt-4 w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden text-left relative"
        >
          {!loading && (
            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-[20px] hover:text-zinc-900 dark:hover:text-white transition-all text-sm font-medium border border-zinc-200 dark:border-zinc-700">
                    {activeFilter} <ChevronDown size={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                >
                  {(
                    ["All", "Tenders", "Grants", "Equity", "Chat"] as FilterType[]
                  ).map((filter) => (
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
              <button
                onClick={onClear}
                className="p-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                aria-label={t("common.close_results")}
              >
                <X size={18} />
              </button>
            </div>
          )}

          <div className="max-h-[400px] overflow-y-auto p-4 space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                <p className="text-zinc-500 dark:text-zinc-400 animate-pulse">
                  {LOADING_MESSAGES[loadingStep]}
                </p>
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
                      rokct.ai › {getOpportunityPath(result.type)} ›{" "}
                      {result.slug}
                    </span>
                  </div>
                  <Link
                    href={`/opportunities/${getOpportunityPath(result.type)}/${encodeURIComponent(result.slug)}`}
                    className="text-xl text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-2"
                  >
                    {result.title}
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                    >
                      {result.type}
                    </Badge>
                    {(result.institution || result.organization) && (
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {result.institution || result.organization}
                      </span>
                    )}
                    {(result.closing_date || result.deadline) && (
                      <span className="text-sm text-zinc-500 dark:text-zinc-500 flex items-center gap-1">
                        • Closes: {result.closing_date || result.deadline}
                      </span>
                    )}
                  </div>
                  {result.category && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      {result.category}
                    </p>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="py-10 text-center pr-8">
                {unrelatedMode ? (
                  <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                    ROK is available when you are logged in
                  </p>
                ) : (
                  <>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      No{" "}
                      {activeFilter !== "All"
                        ? activeFilter.toLowerCase()
                        : ""}{" "}
                      results found for &quot;{lastSearchedQuery}&quot;
                    </p>
                    <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
                      Try searching for something else like
                      &quot;solar&quot; or &quot;education&quot;
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
