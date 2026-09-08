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

import React, { useState } from "react";
import { Brain, Loader2, Search, Sparkles } from "lucide-react";
import t from "@/app/lib/i18n";
import {
  searchEngrams,
  semanticSearchEngrams,
} from "@/app/actions/handson/all/agent/memory";
import {
  EngramSearchResult,
  EngramSemanticResult,
} from "@/app/services/all/agent/memory";

type SearchMode = "metadata" | "semantic";

export default function AgentMemoryPage() {
  const [mode, setMode] = useState<SearchMode>("semantic");
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadataResults, setMetadataResults] = useState<EngramSearchResult[]>([]);
  const [semanticResults, setSemanticResults] = useState<EngramSemanticResult[]>(
    [],
  );

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    setIsSearching(true);
    setError(null);

    if (mode === "semantic") {
      if (!query.trim()) {
        setIsSearching(false);
        return;
      }
      const result = await semanticSearchEngrams(query.trim(), 10);
      setSemanticResults(result.data);
      setError(result.error || null);
    } else {
      const result = await searchEngrams({
        module: query.trim() || undefined,
        limit: 20,
      });
      setMetadataResults(result.data);
      setError(result.error || null);
    }

    setHasSearched(true);
    setIsSearching(false);
  }

  const results: Array<EngramSearchResult | EngramSemanticResult> =
    mode === "semantic" ? semanticResults : metadataResults;

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
          {t("app.agent.memory_title")}
        </h1>
        <p className="text-slate-500 font-medium">{t("app.agent.memory_desc")}</p>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row gap-3 sm:items-center"
      >
        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 w-fit">
          {(["semantic", "metadata"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                mode === value
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {value === "semantic"
                ? t("app.agent.tab_semantic")
                : t("app.agent.tab_metadata")}
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              mode === "semantic"
                ? t("app.agent.semantic_placeholder")
                : t("app.agent.metadata_placeholder")
            }
            className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSearching}
          className="px-6 py-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : mode === "semantic" ? (
            <Sparkles className="w-4 h-4" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          {t("app.agent.search_cta")}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
          {error}
        </div>
      )}

      {!hasSearched ? (
        <div className="py-16 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            {t("app.agent.search_hint")}
          </h3>
        </div>
      ) : results.length === 0 && !isSearching ? (
        <div className="py-16 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            {t("app.agent.no_results")}
          </h3>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((engram) => (
            <div
              key={engram.name}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-bold text-slate-900">
                  {engram.reference_title || engram.reference_name}
                </h3>
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                  {engram.reference_doctype}
                </span>
                {"module" in engram && engram.module && (
                  <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
                    {engram.module}
                  </span>
                )}
              </div>
              {engram.summary && (
                <p className="text-sm text-gray-500 line-clamp-3">
                  {engram.summary}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                {"last_activity_date" in engram && engram.last_activity_date && (
                  <span>{engram.last_activity_date}</span>
                )}
                {"distance" in engram && (
                  <span>
                    {t("app.agent.relevance")}{" "}
                    {(1 - engram.distance).toFixed(3)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
