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

// The agent SDK's chat box for the generic landing hero (base_sdk 1.7.0:
// components/custom/hero.tsx), registered in
// components/custom/landing/hero-form.ts by this SDK's manifest integration.
// Ray, 2026-09-08: "chat box is for chat related stuff, i think if agent
// sdk is home it inject that chat" - so the search-style input, its
// typewriter placeholders and the submit that used to sit inside the hero
// itself are here, markup untouched. The sections registered in
// components/custom/landing/hero-sections.ts (this SDK's
// agent-opportunities among them) answer the submitted query under the
// input and are loaded and rendered here, not by the hero; with none
// registered a submit goes to the hero copy's fallbackHref. What the hero
// still needs to know - that the visitor is using the box, that results are
// showing, the headline words the sections add - goes back through the
// props' callbacks.
//
// Typed structurally against base_sdk's HeroFormProps (hero-form.ts) rather
// than importing it, so a shell composed with this SDK and a base_sdk older
// than 1.7.0 (no hero-form.ts yet) still type-checks: the file is simply
// unused there, and the hero keeps its own box.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight, Loader2 } from "lucide-react";

import { BrandLogo } from "@/components/custom/brand-logo";
import type {
  HeroConfig,
  HeroWord,
} from "@/components/custom/landing/hero-config";
import {
  HERO_SECTIONS,
  type HeroSectionComponent,
  type HeroSectionMeta,
} from "@/components/custom/landing/hero-sections";

/** Mirrors base_sdk's HeroFormProps (components/custom/landing/hero-form.ts). */
type AgentHeroFormProps = {
  hero: HeroConfig;
  signupUrl: string;
  onFocusChange?: (focused: boolean) => void;
  onActiveChange?: (active: boolean) => void;
  onHeadlineWordsChange?: (words: HeroWord[]) => void;
};

interface LoadedSection {
  id: string;
  Component: HeroSectionComponent;
  meta: HeroSectionMeta;
}

function TypewriterPlaceholder({
  placeholders,
  isSearching,
  isFocused,
  onPlaceholderChange,
  onFadingChange,
}: {
  placeholders: string[];
  isSearching: boolean;
  isFocused: boolean;
  onPlaceholderChange?: (index: number) => void;
  onFadingChange?: (fading: boolean) => void;
}) {
  const [currentText, setCurrentText] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (isSearching || isFocused || placeholders.length === 0) return;

    if (isFading) {
      const timeout = setTimeout(() => {
        setIsFading(false);
        onFadingChange?.(false);
        setCurrentText("");
        const nextIndex = (placeholderIndex + 1) % placeholders.length;
        setPlaceholderIndex(nextIndex);
        onPlaceholderChange?.(nextIndex);
        setIsTyping(true);
      }, 500); // Fade duration
      return () => clearTimeout(timeout);
    }

    if (isTyping) {
      const fullText = placeholders[placeholderIndex % placeholders.length];
      if (currentText.length < fullText.length) {
        const timeout = setTimeout(() => {
          setCurrentText(fullText.substring(0, currentText.length + 1));
        }, 150);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false);
          setIsFading(true);
          onFadingChange?.(true);
        }, 2000); // Wait before fade
        return () => clearTimeout(timeout);
      }
    }
  }, [
    currentText,
    isTyping,
    isFading,
    placeholderIndex,
    placeholders,
    isSearching,
    isFocused,
    onPlaceholderChange,
    onFadingChange,
  ]);

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
        {isTyping && (
          <span className="w-[1.5px] h-5 bg-purple-500 ml-0.5 animate-pulse" />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default function AgentHeroForm({
  hero,
  signupUrl,
  onFocusChange,
  onActiveChange,
  onHeadlineWordsChange,
}: AgentHeroFormProps) {
  const router = useRouter();
  const [sections, setSections] = useState<LoadedSection[]>([]);
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [submitId, setSubmitId] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [frozenIcon, setFrozenIcon] = useState<"logo" | "search" | null>(null);

  // Load the registered sections once, on the client. A section that fails
  // to load is logged and skipped; the box still renders.
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      HERO_SECTIONS.map(async (entry): Promise<LoadedSection | null> => {
        try {
          const mod = await entry.load();
          return { id: entry.id, Component: mod.default, meta: mod.meta ?? {} };
        } catch (error) {
          console.error(`[hero] failed to load section "${entry.id}":`, error);
          return null;
        }
      }),
    ).then((loaded) => {
      if (!cancelled) {
        setSections(loaded.filter((s): s is LoadedSection => s !== null));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // The sections' headline words go to the hero's rotation.
  useEffect(() => {
    onHeadlineWordsChange?.(sections.flatMap((s) => s.meta.headlineWords ?? []));
  }, [sections, onHeadlineWordsChange]);

  const placeholders = useMemo(
    () => [
      ...hero.placeholders,
      ...sections.flatMap((s) => s.meta.placeholders ?? []),
    ],
    [hero.placeholders, sections],
  );

  const isActive = activeIds.length > 0;
  const isBusy = busyIds.length > 0;

  // The hero collapses its wordmark while the visitor is using the box
  // and tells the page while a section shows results
  useEffect(() => {
    onFocusChange?.(isFocused);
  }, [isFocused, onFocusChange]);

  useEffect(() => {
    onActiveChange?.(isActive);
  }, [isActive, onActiveChange]);

  // Erasing the input withdraws the query from every section
  useEffect(() => {
    if (query === "") setSubmittedQuery("");
  }, [query]);

  const currentPlaceholder = placeholders[placeholderIndex % placeholders.length];
  const shouldShowLogo =
    !query &&
    !!currentPlaceholder &&
    currentPlaceholder
      .toLowerCase()
      .includes(hero.logoPlaceholderToken.toLowerCase());

  useEffect(() => {
    if (!isFocused) {
      const newIcon = shouldShowLogo ? "logo" : "search";
      if (newIcon !== frozenIcon) {
        setFrozenIcon(newIcon);
      }
    }
  }, [isFocused, shouldShowLogo, frozenIcon]);

  const setSectionActive = useCallback((sectionId: string, active: boolean) => {
    setActiveIds((prev) => {
      const has = prev.includes(sectionId);
      if (has === active) return prev;
      return active ? [...prev, sectionId] : prev.filter((x) => x !== sectionId);
    });
  }, []);

  const setSectionBusy = useCallback((sectionId: string, busy: boolean) => {
    setBusyIds((prev) => {
      const has = prev.includes(sectionId);
      if (has === busy) return prev;
      return busy ? [...prev, sectionId] : prev.filter((x) => x !== sectionId);
    });
  }, []);

  const sectionHandlers = useMemo(
    () =>
      Object.fromEntries(
        sections.map((s) => [
          s.id,
          {
            onActiveChange: (active: boolean) => setSectionActive(s.id, active),
            onBusyChange: (busy: boolean) => setSectionBusy(s.id, busy),
          },
        ]),
      ),
    [sections, setSectionActive, setSectionBusy],
  );

  const clear = useCallback(() => {
    setQuery("");
    setSubmittedQuery("");
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (HERO_SECTIONS.length === 0) {
      router.push(hero.fallbackHref(trimmed, signupUrl));
      return;
    }

    setSubmittedQuery(trimmed);
    setSubmitId((prev) => prev + 1);
  };

  const activeIcon = isFocused
    ? frozenIcon || "search"
    : shouldShowLogo
      ? "logo"
      : "search";

  return (
    /* Search-style CTA */
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="w-full max-w-3xl px-4"
    >
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center p-[1px] bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-indigo-500/30 rounded-[24px] group focus-within:from-purple-500 focus-within:to-indigo-500 transition-all shadow-[0_0_40px_rgba(139,92,246,0.12)]"
      >
        <div className="flex items-center w-full bg-white dark:bg-black rounded-[23px] p-1">
          <div
            className="pl-3 flex items-center text-zinc-400 dark:text-zinc-500 transition-opacity duration-500"
            style={{
              opacity: isFading && !isFocused && !query ? 0 : 1,
            }}
          >
            {activeIcon === "logo" ? (
              <BrandLogo
                width={20}
                height={20}
                variant="auto"
                showBadge={false}
                isCircle={true}
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            )}
          </div>
          <div className="relative w-full overflow-hidden">
            <TypewriterPlaceholder
              placeholders={placeholders}
              isSearching={!!query}
              isFocused={isFocused}
              onPlaceholderChange={setPlaceholderIndex}
              onFadingChange={setIsFading}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder=""
              className="w-full bg-transparent border-none outline-none focus:ring-0 focus:outline-none px-5 py-3 text-base md:text-lg text-zinc-900 dark:text-white placeholder-transparent font-medium relative z-10"
            />
          </div>

          <button
            type="submit"
            disabled={isBusy}
            className={`mr-1.5 p-3 rounded-[20px] transition-all active:scale-95 disabled:opacity-50 ${
              query.trim().length > 0
                ? "bg-yellow-400 text-black hover:bg-yellow-500"
                : "bg-zinc-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {isBusy ? (
              <Loader2 className="animate-spin" size={20} />
            ) : query.trim().length > 0 ? (
              <ArrowRight size={20} strokeWidth={2.5} />
            ) : (
              <ArrowUpRight size={20} />
            )}
          </button>
        </div>
      </form>

      {/* Registered sections answer the submitted query under the input */}
      {sections.map(({ id: sectionId, Component }) => (
        <Component
          key={sectionId}
          query={submittedQuery}
          submitId={submitId}
          signupUrl={signupUrl}
          onActiveChange={sectionHandlers[sectionId].onActiveChange}
          onBusyChange={sectionHandlers[sectionId].onBusyChange}
          onClear={clear}
        />
      ))}
    </motion.div>
  );
}
