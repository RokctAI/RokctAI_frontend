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

// Copy for the live plan cards on rokct.ai's landing (pricing.tsx and its
// client half), which register themselves into base_sdk's generic landing
// host through components/custom/landing/page-sections.ts.
//
// Ray, 2026-09-03: each home SDK holds its own landing page, so the words
// and the plan presentation live here, in the home SDK, and base_sdk's
// components/custom/landing/landing-config.ts keeps only the generic values
// (auth URLs, the nav's ends, the plans query). A block that is `null` is
// not rendered at all.
//
// 1.24.0 (Ray approved the rokct.ai redesign on 2026-11-01): the rest of
// the page - hero, platform, how it works, the pictures, funding, plans
// ladder, own address, FAQ and the closing box - is the redesign's, and
// its words are in ./rokct-landing-content.ts. The blocks this file held
// for the sections the redesign replaced (social, features, workflow,
// compare, faq, testimonials) are gone with those sections: they were the
// Chrome-extension landing copied from Merlin AI (its "Use OpenAI o1"
// cards, its Chrome Web Store call to action, its testimonials), none of
// it rokct.ai's. Only the plan cards stay, under the ladder.

import { AI_MODELS } from "@/ai/models";
import { PLATFORM_NAME } from "@/app/config/platform";

/** What `PricingConfig.localize` resolves to: the visitor's currency. */
export interface PricingLocale {
  currency: string;
  currency_symbol?: string | null;
  exchange_rate: number;
  country_name?: string | null;
}

export interface PricingConfig {
  /** The category tab selected on load. */
  defaultCategory: string;
  /** Display labels per category id; others are title-cased. */
  categoryLabels: Record<string, string>;
  /** Tailwind classes per category tab; others get `defaultCategoryStyle`. */
  categoryStyles: Record<string, string>;
  defaultCategoryStyle: string;
  /** Categories never shown (lower-case ids). */
  hiddenCategories: string[];
  /** Categories whose free plans are hidden (lower-case ids). */
  hideFreePlansIn: string[];
  /** `{token}` substitutions applied to plan feature lines. */
  featureTokens: Record<string, string>;
  /**
   * Resolves the visitor's currency for local prices, or `null` to price
   * everything in USD. Runs on the client after the plans render.
   */
  localize: (() => Promise<PricingLocale | null>) | null;
  labels: {
    joinFree: string;
    daysFree: (days: number) => string;
    select: (plan: string) => string;
    annualBilling: string;
    save: (amount: string) => string;
    seats: string;
    billedAs: (usd: number) => string;
    approx: string;
    global: string;
  };
  ready: { heading: string; blurb: string; cta: string };
}

export interface AgentLandingConfig {
  pricing: PricingConfig | null;
}

/** "gpt-4o-mini" -> "Gpt 4o Mini": the label plan features use for `{model}`. */
function modelLabel(id: string): string {
  return id.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

const ACTIVE_TAB =
  "data-[state=active]:text-white dark:data-[state=active]:text-black";

export const AGENT_LANDING_CONFIG: AgentLandingConfig = {
  pricing: {
    defaultCategory: "rokct",
    categoryLabels: { rokct: "ROKCT/ERP" },
    categoryStyles: {
      rokct: `text-indigo-600 border-indigo-200 dark:text-indigo-400 dark:border-indigo-800 hover:border-indigo-500 hover:text-indigo-500 data-[state=active]:bg-indigo-600 data-[state=active]:border-indigo-600 dark:data-[state=active]:bg-indigo-400 dark:data-[state=active]:border-indigo-400 ${ACTIVE_TAB}`,
      telephony: `text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800 hover:border-blue-500 hover:text-blue-500 data-[state=active]:bg-blue-600 data-[state=active]:border-blue-600 dark:data-[state=active]:bg-blue-400 dark:data-[state=active]:border-blue-400 ${ACTIVE_TAB}`,
      hosting: `text-orange-600 border-orange-200 dark:text-orange-400 dark:border-orange-800 hover:border-orange-500 hover:text-orange-500 data-[state=active]:bg-orange-600 data-[state=active]:border-orange-600 dark:data-[state=active]:bg-orange-400 dark:data-[state=active]:border-orange-400 ${ACTIVE_TAB}`,
      lending: `text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800 hover:border-emerald-500 hover:text-emerald-500 data-[state=active]:bg-emerald-600 data-[state=active]:border-emerald-600 dark:data-[state=active]:bg-emerald-400 dark:data-[state=active]:border-emerald-400 ${ACTIVE_TAB}`,
      paas: `text-teal-600 border-teal-200 dark:text-teal-400 dark:border-teal-800 hover:border-teal-500 hover:text-teal-500 data-[state=active]:bg-teal-600 data-[state=active]:border-teal-600 dark:data-[state=active]:bg-teal-400 dark:data-[state=active]:border-teal-400 ${ACTIVE_TAB}`,
    },
    defaultCategoryStyle:
      "text-slate-600 border-slate-200 hover:border-slate-500 hover:text-slate-500 data-[state=active]:bg-slate-600 data-[state=active]:text-white dark:text-slate-400 dark:border-slate-800",
    hiddenCategories: ["lms", "hosting", "paas", "telephony"],
    hideFreePlansIn: ["rokct"],
    featureTokens: { model: modelLabel(AI_MODELS.PAID.id) },
    localize: () =>
      import("@/lib/actions/getPricingMetadata").then((m) =>
        m.getPricingMetadata(),
      ),
    labels: {
      joinFree: "Join for Free",
      daysFree: (days) => `${days} Days Free`,
      select: (plan) => `Select ${plan}`,
      annualBilling: "Annual Billing",
      save: (amount) => `Save ${amount}/yr!`,
      seats: "Seats",
      billedAs: (usd) => `Billed as $${usd} USD`,
      approx: "Approx.",
      global: "Global",
    },
    ready: {
      heading: "Ready to get started?",
      blurb: `Start with accounting and switch on more of ${PLATFORM_NAME} as the business grows.`,
      cta: "Start Free Trial",
    },
  },
};
