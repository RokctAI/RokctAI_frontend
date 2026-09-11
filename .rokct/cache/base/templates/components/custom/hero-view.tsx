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

// The generic landing hero's VIEW (since 1.32.0): brand, a rotating
// headline, a slot for the home SDK's form and the store badges, drawn
// from the copy it is handed as props. The server wrapper
// (components/custom/hero.tsx) resolves that copy - HERO_CONFIG overlaid by
// whatever the home SDK registered in ./landing/hero-copy.ts - and hands
// it here, so the first HTML already carries the headline, the trust line
// and the badges; nothing is loaded after mount. What stays on the client
// is what only the client can do: the word rotation timer, the visitor's
// branding cache (localStorage) and what the registered form reports back.
//
// Hydration-safe by construction: the first client render is the server's
// render. The word index starts at 0 on both sides, the branding cache is
// read only after mount (the server, and the first client pass, draw
// without it), and the copy is the same object on both sides. Framer's
// entrance animations are off on the elements that carry the copy
// (`initial={false}` on the wordmark block, the h1 and the badges block,
// and on the word's AnimatePresence): the server would otherwise write
// `opacity: 0` into the HTML and the text stayed invisible until the
// client bundle ran - or forever, without JavaScript. The word swap still
// animates on every rotation after the first.
//
// The form (rokctapp's chat box, registered by agent_sdk in
// ./landing/hero-form.ts) still loads through next/dynamic, server-rendered
// with the rest; with no form registered the slot renders nothing.

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Chrome } from "lucide-react";

import { BrandLogo } from "@/components/custom/brand-logo";
import { markImageClass } from "@/components/custom/landing/brand-marks";
import { Branding } from "@/components/custom/branding";
import {
  HERO_CONFIG,
  type HeroBadge,
  type HeroConfig,
  type HeroWord,
} from "@/components/custom/landing/hero-config";
import {
  HERO_COPY,
  loadHeroCopy,
  type HeroCopy,
} from "@/components/custom/landing/hero-copy";
import {
  HERO_FORM,
  loadHeroForm,
  type HeroFormProps,
} from "@/components/custom/landing/hero-form";
import type { HeroWordmark } from "@/components/custom/landing/landing-page";

/**
 * The copy the view is handed: every HeroConfig field but `fallbackHref`,
 * the one function-typed field, which cannot cross the server-to-client
 * boundary as a prop. It is resolved beside the form that consumes it
 * (see HeroForm below), so a registered copy's override still reaches
 * the form.
 */
export type HeroViewCopy = Omit<HeroConfig, "fallbackHref">;

/**
 * How the hero reports that its form is showing results, when the page
 * that hosts it did not pass `onResultsChange` itself: the landing host's
 * client wrapper provides the setter here and the server-rendered hero
 * reaches it without a function ever crossing the server boundary.
 */
export const HeroResultsContext = createContext<
  ((hasResults: boolean) => void) | null
>(null);

// What the form slot renders when a registered form fails to load: nothing.
function NoHeroForm(_props: HeroFormProps) {
  return null;
}

// The registered form, resolved once per module through next/dynamic so it
// is server-rendered with the rest of the hero (the lazy loader suspends
// until the module is in, on the server and on the client alike, and adds
// no wrapper node of its own). With nothing registered there is no loader
// at all: the slot renders nothing on the server and on the client, so the
// markup is deterministic either way. The form takes the whole HeroConfig,
// `fallbackHref` included; that field is resolved here, in the same
// loader, from the registered copy (or HERO_CONFIG's default) - the one
// place on the client the copy registry is read, and never in an effect.
const HeroForm: React.ComponentType<HeroFormProps> | null =
  HERO_FORM.length === 0
    ? null
    : dynamic<HeroFormProps>(() =>
        Promise.all([
          loadHeroForm(),
          HERO_COPY.length === 0 ? Promise.resolve<HeroCopy>({}) : loadHeroCopy(),
        ]).then(([Form, copy]) => {
          const Resolved = Form ?? NoHeroForm;
          const fallbackHref = copy.fallbackHref ?? HERO_CONFIG.fallbackHref;
          return {
            default: function HeroFormWithFallback(props: HeroFormProps) {
              return <Resolved {...props} hero={{ ...props.hero, fallbackHref }} />;
            },
          };
        }),
      );

/** True when the badge has something to draw: a built-in glyph or an image with a src. */
export function hasBadgeIcon(badge: Pick<HeroBadge, "icon">): boolean {
  const icon = badge.icon;
  if (!icon) return false;
  if (typeof icon === "string") return icon === "app-store" || icon === "chrome";
  return icon.src.trim().length > 0;
}

function BadgeIcon({ icon }: { icon: HeroBadge["icon"] }) {
  if (!icon) return null;
  if (icon === "chrome") {
    return <Chrome className="w-6 h-6" aria-hidden="true" />;
  }
  if (icon === "app-store") {
    return (
      <svg viewBox="0 0 384 512" fill="currentColor" className="w-7 h-7">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-31.4-73.3-114.8-1.7-152zM219 114.4c15.7-20 26.2-47.6 23.3-75.1-23.3 1-51.2 15.5-67.9 35.1-14.9 17.5-27.1 46-24.2 72.3 25.4 2 51.1-12.3 68.8-32.3z" />
      </svg>
    );
  }
  if (!icon.src.trim()) return null;
  // 1.26.0: a monochrome mark base serves itself (/brand/marks/app-store.svg,
  // /brand/marks/windows.svg) is `currentColor` inside an <img>, i.e. black,
  // so it carries `dark:invert` on the dark shell; the rule is brand-marks.ts'
  // markImageClass, keyed on the src alone. Every other image: no filter.
  return (
    <Image
      src={icon.src}
      alt={icon.alt}
      width={24}
      height={24}
      className={markImageClass(icon.src)}
    />
  );
}

/**
 * The wordmark slot: the host's own Branding component (the default, what
 * every shell drew before 1.32.0), or - when the home SDK's copy declared
 * `brand: "stem"` - the platform name's stem as text, the full name on its
 * aria-label and title. The stem is sized to the slot's 250px the way the
 * header sizes its stem wordmark: the large 76px when it fits, else what
 * fits at 0.6em per character, so a long stem never overflows the slot.
 */
// The stem wordmark's text (1.32.0's `brand: "stem"`), in the slot's
// padding div. Since 1.36.0 the span carries its own em padding
// (HERO_STEM_PADDING_CLASS): the slot clips its overflow (that is how it
// closes when the form takes over), and at `leading-none` the line box is
// exactly 1em while a face's descenders reach below it - Inter's by about
// 0.11em, Montserrat's by 0.07em - so the bottom of a "g" or a "p" was
// cut flat, and an italic face's last glyph overhangs its advance width
// and lost its right edge (Ray, 2026-09-10, on supacharge: "supa name in
// hero cut off on g and e"). The padding is on the span, not on its line
// height, because a home SDK restyles this span from outside (face, size,
// `line-height: 1 !important`) and would undo a leading change; padding it
// leaves alone. It is symmetric so the glyphs do not move: the row is a
// fixed 72px with the slot centred in it, so equal padding above and
// below keeps the baseline where it was and only the slot's box grows.
export const HERO_STEM_PADDING_CLASS = "py-[0.15em] px-[0.05em]";

function HeroWordmarkSlot({ wordmark }: { wordmark: HeroWordmark | null }) {
  if (!wordmark) {
    return (
      <Branding
        showBadge={false}
        className="text-[76px] tracking-tighter leading-none"
      />
    );
  }
  return (
    <span
      aria-label={wordmark.name}
      title={wordmark.name}
      className={`inline-block whitespace-nowrap font-sans font-bold tracking-tighter leading-none text-black dark:text-white ${HERO_STEM_PADDING_CLASS}`}
      style={{
        fontSize: `min(76px, calc(250px / (${Math.max(wordmark.text.length, 1)} * 0.6)))`,
      }}
    >
      {wordmark.text}
    </span>
  );
}

export interface HeroViewProps {
  /** The resolved copy: HERO_CONFIG overlaid by the registered hero copy, minus `fallbackHref`. */
  hero: HeroViewCopy;
  /** What the wordmark slot shows as text; null draws the host's Branding. */
  wordmark?: HeroWordmark | null;
  signupUrl?: string;
  id?: string;
  /** Reports whether the form is showing results; HeroResultsContext stands in when absent. */
  onResultsChange?: (hasResults: boolean) => void;
}

export function HeroView({
  hero,
  wordmark = null,
  signupUrl = "/register",
  id,
  onResultsChange,
}: HeroViewProps) {
  const reportResults = useContext(HeroResultsContext);
  // 1.23.0: a badge without an icon is not drawn (below `md` it would be an
  // empty pill), so a badge waits for its icon rather than inventing one.
  const badges = useMemo(() => hero.badges.filter(hasBadgeIcon), [hero.badges]);
  const [wordIndex, setWordIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  // What the registered form reports back: whether the visitor is using it,
  // whether it is showing results, and any headline words of its own.
  const [formFocused, setFormFocused] = useState(false);
  const [formActive, setFormActive] = useState(false);
  const [formWords, setFormWords] = useState<HeroWord[]>([]);

  const words = useMemo(
    () => [...hero.headlineWords, ...formWords],
    [hero.headlineWords, formWords],
  );
  // Index 0 on the server and on the first client render alike.
  const word = words.length > 0 ? words[wordIndex % words.length] : undefined;

  // Notify the page when the form shows/hides results.
  useEffect(() => {
    onResultsChange?.(formActive);
    if (!onResultsChange) reportResults?.(formActive);
  }, [formActive, onResultsChange, reportResults]);

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
        {/* Top Graphics & Logo: visible in the first HTML (initial={false}) */}
        <motion.div
          initial={false}
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
                <HeroWordmarkSlot wordmark={wordmark} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Headline: the server's text is visible before hydration (initial={false}) */}
        <div className="mb-12 h-[1.2em] flex items-end md:items-center justify-center">
          {word && (
            <motion.h1
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight flex flex-wrap items-center justify-center gap-x-3"
            >
              <div className="relative inline-flex items-center justify-center">
                <AnimatePresence mode="wait" initial={false}>
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
                <AnimatePresence mode="wait" initial={false}>
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
            // The loader above fills `fallbackHref` in; the cast is the
            // only place the view's copy is widened to the form's contract.
            hero={hero as HeroConfig}
            signupUrl={signupUrl}
            onFocusChange={setFormFocused}
            onActiveChange={setFormActive}
            onHeadlineWordsChange={setFormWords}
          />
        )}

        {/* Social Proof & Platform badges (1.23.0: a badge without an icon is not drawn) */}
        {badges.length > 0 && (
          <motion.div
            initial={false}
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
              {badges.map((badge) => (
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
