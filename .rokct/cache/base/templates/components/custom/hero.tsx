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

// The generic landing hero: brand, a rotating headline, a slot for the home
// SDK's form and the store badges. It carries no product feature of its
// own - copy comes from ./landing/hero-config.ts, overlaid by whatever the
// home SDK registered in ./landing/hero-copy.ts, and what sits between the
// headline and the badges (rokctapp's chat box, registered by agent_sdk) is
// whatever the home SDK registered in ./landing/hero-form.ts. With no form
// registered the slot renders nothing and the hero is the headline, trust
// line and badges alone.

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { BrandLogo } from "@/components/custom/brand-logo";
import { Branding } from "@/components/custom/branding";
import {
  HERO_CONFIG,
  type HeroBadge,
  type HeroConfig,
  type HeroWord,
} from "@/components/custom/landing/hero-config";
import { HERO_COPY, loadHeroCopy } from "@/components/custom/landing/hero-copy";
import {
  HERO_FORM,
  loadHeroForm,
  type HeroFormProps,
} from "@/components/custom/landing/hero-form";

// What the hero renders while a registered copy module is still loading: no
// words at all, so a shell whose home SDK supplies the copy never shows the
// default copy first. Only reached when ./landing/hero-copy.ts has an entry;
// with none the hero starts on HERO_CONFIG and this is never used.
const PENDING_HERO: HeroConfig = {
  ...HERO_CONFIG,
  headlineWords: [],
  headlineSuffix: "",
  placeholders: [],
  backgroundImage: "",
  trustLine: [],
  badges: [],
};

// What the form slot renders when a registered form fails to load: nothing.
function NoHeroForm(_props: HeroFormProps) {
  return null;
}

// The registered form, resolved once per module through next/dynamic so it
// is server-rendered with the rest of the hero (the lazy loader suspends
// until the module is in, on the server and on the client alike, and adds
// no wrapper node of its own). With nothing registered there is no loader
// at all: the slot renders nothing on the server and on the client, so the
// markup is deterministic either way.
const HeroForm: React.ComponentType<HeroFormProps> | null =
  HERO_FORM.length === 0
    ? null
    : dynamic<HeroFormProps>(() =>
        loadHeroForm().then((Form) => ({ default: Form ?? NoHeroForm })),
      );

function BadgeIcon({ icon }: { icon: HeroBadge["icon"] }) {
  if (icon === "app-store") {
    return (
      <svg viewBox="0 0 384 512" fill="currentColor" className="w-7 h-7">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-31.4-73.3-114.8-1.7-152zM219 114.4c15.7-20 26.2-47.6 23.3-75.1-23.3 1-51.2 15.5-67.9 35.1-14.9 17.5-27.1 46-24.2 72.3 25.4 2 51.1-12.3 68.8-32.3z" />
      </svg>
    );
  }
  return <Image src={icon.src} alt={icon.alt} width={24} height={24} />;
}

export function Hero({
  signupUrl = "/register",
  id,
  onResultsChange,
}: {
  signupUrl?: string;
  id?: string;
  onResultsChange?: (hasResults: boolean) => void;
}) {
  const [copy, setCopy] = useState<HeroConfig | null>(
    HERO_COPY.length === 0 ? HERO_CONFIG : null,
  );
  const hero = copy ?? PENDING_HERO;
  const [wordIndex, setWordIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  // What the registered form reports back: whether the visitor is using it,
  // whether it is showing results, and any headline words of its own.
  const [formFocused, setFormFocused] = useState(false);
  const [formActive, setFormActive] = useState(false);
  const [formWords, setFormWords] = useState<HeroWord[]>([]);

  // Resolve the registered hero copy once, on the client. With nothing
  // registered the hero is on HERO_CONFIG from the first render already.
  useEffect(() => {
    if (HERO_COPY.length === 0) return;
    let cancelled = false;
    loadHeroCopy().then((override) => {
      if (!cancelled) setCopy({ ...HERO_CONFIG, ...override });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const words = useMemo(
    () => [...hero.headlineWords, ...formWords],
    [hero.headlineWords, formWords],
  );
  // No headline until the copy is resolved, even if the form's words are in.
  const word = copy ? words[wordIndex % words.length] : undefined;

  // Notify parent when the form shows/hides results
  useEffect(() => {
    onResultsChange?.(formActive);
  }, [formActive, onResultsChange]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { wordIntervalMs } = hero;
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => prev + 1);
    }, wordIntervalMs);
    return () => clearInterval(interval);
  }, [wordIntervalMs]);

  const branding =
    mounted && typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("rokct_branding_data") || "null")
      : null;

  // Collapse hero logo/text when the visitor is using the form
  const isExpanded = formFocused || formActive;

  return (
    <section
      id={id}
      className="relative w-full overflow-hidden bg-white dark:bg-[#0a0a0a] pt-16 pb-10"
    >
      {/* Background Vector */}
      {hero.backgroundImage && (
        <div className="absolute inset-0 z-0 opacity-10 dark:opacity-30">
          <Image
            src={hero.backgroundImage}
            alt="background"
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Top Graphics & Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-[6.7rem] mt-16 md:mt-24 flex flex-col items-center justify-center"
        >
          <div className="flex flex-row items-center justify-center h-[72px]">
            <div className="relative flex items-center h-[56px]">
              <BrandLogo width={56} height={56} showBadge={true} />
              {/* Country code appears next to logo only when text is collapsed */}
              <div
                className="transition-all duration-500 overflow-hidden flex items-start"
                style={{
                  opacity: isExpanded && branding?.code ? 1 : 0,
                  width: isExpanded && branding?.code ? "28px" : "0px",
                  height: "56px",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    alignSelf: "flex-start",
                    marginTop: "-2px",
                    fontSize: "16px",
                    fontWeight: 500,
                    marginLeft: "6px",
                    color: "inherit",
                  }}
                >
                  {branding?.code}
                </span>
              </div>
            </div>
            <div
              className="overflow-hidden transition-all duration-500 ease-in-out flex items-center"
              style={{
                width: isExpanded ? "0px" : "250px",
                opacity: isExpanded ? 0 : 1,
              }}
            >
              <div
                className="pl-3 flex items-center"
                style={{ paddingTop: "4px" }}
              >
                <Branding
                  showBadge={false}
                  className="text-[76px] tracking-tighter leading-none"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Headline */}
        <div className="mb-12 h-[1.2em] flex items-end md:items-center justify-center">
          {word && (
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight flex flex-wrap items-center justify-center gap-x-3"
            >
              <div className="relative inline-flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={word.text}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="font-serif italic font-extrabold text-primary text-4xl md:text-5xl lg:text-6xl"
                  >
                    {word.text}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-4">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={word.verb}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {word.verb}
                  </motion.span>
                </AnimatePresence>
                <span>{hero.headlineSuffix}</span>
              </div>
            </motion.h1>
          )}
        </div>

        {/* The home SDK's form (rokctapp: agent_sdk's chat box); nothing when none is registered */}
        {HeroForm && (
          <HeroForm
            hero={hero}
            signupUrl={signupUrl}
            onFocusChange={setFormFocused}
            onActiveChange={setFormActive}
            onHeadlineWordsChange={setFormWords}
          />
        )}

        {/* Social Proof & Platform badges */}
        {hero.badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 flex flex-col items-center gap-6"
          >
            {hero.trustLine.length > 0 && (
              <div className="flex items-center gap-4 text-zinc-900 dark:text-white text-base md:text-lg font-semibold opacity-80">
                {hero.trustLine.map((claim, idx) => (
                  <React.Fragment key={claim}>
                    {idx > 0 && (
                      <div className="w-[1px] h-6 bg-zinc-200 dark:bg-white/20" />
                    )}
                    <span>{claim}</span>
                  </React.Fragment>
                ))}
              </div>
            )}

            <div className="flex flex-wrap justify-center items-center gap-4">
              {hero.badges.map((badge) => (
                <Link
                  key={badge.id}
                  href={badge.href}
                  className="flex items-center gap-0 md:gap-3 bg-white dark:bg-zinc-900 text-black dark:text-white px-3 py-3 md:px-6 rounded-xl hover:scale-105 transition-all shadow-md border border-zinc-100 dark:border-zinc-800 active:scale-95"
                >
                  <BadgeIcon icon={badge.icon} />
                  <div className="hidden md:flex flex-col items-start leading-none">
                    <span className="text-[10px] uppercase font-bold text-gray-500 mb-0.5">
                      {badge.eyebrow}
                    </span>
                    <span className="text-base font-bold">{badge.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
