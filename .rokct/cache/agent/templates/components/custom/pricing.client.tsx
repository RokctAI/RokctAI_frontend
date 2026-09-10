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

// The plan cards' CLIENT half (since 1.18.0): the billing toggle, the
// currency selector, the localisation effect, the category scroll and the
// tab state, unchanged. Rendered by ./pricing.tsx, the section's entry,
// which holds `meta` where the server can read it.

// The landing page's plan cards. The plans come from the page
// (app/landing/page.tsx prefetches them through app/actions/base/landing.ts
// with LANDING_CONFIG.plansQuery); with none the section renders
// nothing. Category tabs, labels, styles, the `{token}` substitutions in
// feature lines and the optional currency localisation all come from
// AGENT_LANDING_CONFIG.pricing.

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CheckIcon } from "lucide-react";

import type { LandingPlan } from "@/app/actions/base/landing";
import {
  AGENT_LANDING_CONFIG,
  type PricingLocale,
} from "@/components/custom/landing/agent-landing-config";
import { LANDING_CONFIG } from "@/components/custom/landing/landing-config";
import type { PageSectionProps } from "@/components/custom/landing/page-sections";

const isYearly = (interval?: string) =>
  ["year", "yearly"].includes((interval ?? "").toLowerCase());
const isMonthly = (interval?: string) =>
  ["month", "monthly"].includes((interval ?? "").toLowerCase());

/** "Pro (Legacy) Monthly" -> "Pro": the name shared by a plan's monthly and yearly rows. */
function cleanPlanName(name: unknown): string {
  if (typeof name !== "string" || !name) return "Unknown Plan";
  return (
    name
      .replace(/\s*\(.*\)\s*/, "")
      .replace(/[._\-\s]+/g, " ")
      .replace(/\s*(Monthly|Yearly)\s*/i, "")
      .replace(/-+$/, "")
      .trim() || "Unknown Plan"
  );
}

export function Pricing({
  plans,
  category,
  onCategoryChange,
  id,
}: {
  plans: LandingPlan[];
  /** The selected category tab; the cards scroll to its first plan. */
  category?: string;
  onCategoryChange?: (category: string) => void;
  id?: string;
}) {
  const config = AGENT_LANDING_CONFIG.pricing;
  const [isAnnual, setIsAnnual] = useState(false);
  const [locale, setLocale] = useState<PricingLocale | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const hidden = useMemo(
    () => new Set((config?.hiddenCategories ?? []).map((c) => c.toLowerCase())),
    [config],
  );
  const hideFree = useMemo(
    () => new Set((config?.hideFreePlansIn ?? []).map((c) => c.toLowerCase())),
    [config],
  );

  // The category tabs, derived from the plans: the default category first,
  // the rest alphabetical.
  const categories = useMemo(() => {
    if (!config) return [];
    const found = new Set<string>();
    plans.forEach((p) => {
      const cat = p.category;
      if (cat && !hidden.has(cat.toLowerCase())) found.add(cat);
    });
    const first = config.defaultCategory.toLowerCase();
    return Array.from(found)
      .map((cat) => ({
        id: cat,
        label:
          config.categoryLabels[cat.toLowerCase()] ??
          cat.charAt(0).toUpperCase() + cat.slice(1),
        style:
          config.categoryStyles[cat.toLowerCase()] ??
          config.defaultCategoryStyle,
      }))
      .sort((a, b) => {
        if (a.id.toLowerCase() === first) return -1;
        if (b.id.toLowerCase() === first) return 1;
        return a.label.localeCompare(b.label);
      });
  }, [config, plans, hidden]);

  // Ask the host where the visitor is, once the plans are on screen.
  useEffect(() => {
    if (!config?.localize || plans.length === 0) return;
    let cancelled = false;
    config
      .localize()
      .then((result) => {
        if (cancelled || !result || !result.currency) return;
        setLocale(result);
        setCurrency(result.currency);
      })
      .catch((e) => console.log("[landing] pricing localisation failed", e));
    return () => {
      cancelled = true;
    };
  }, [config, plans.length]);

  const displayedPlans = useMemo(() => {
    const order = categories.map((c) => c.id.toLowerCase());
    return plans
      .filter((plan) => {
        const cat = (plan.category ?? "").toLowerCase();
        if (hidden.has(cat)) return false;
        if (hideFree.has(cat) && plan.cost === 0) return false;
        const name = plan.plan_name ?? "";
        return isAnnual ? name.includes("Yearly") : name.includes("Monthly");
      })
      .sort((a, b) => {
        const ia = order.indexOf((a.category ?? "").toLowerCase());
        const ib = order.indexOf((b.category ?? "").toLowerCase());
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return (a.cost || 0) - (b.cost || 0);
      });
  }, [plans, categories, hidden, hideFree, isAnnual]);

  // Scroll the cards to the selected category's first plan.
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!category || displayedPlans.length === 0 || !container) return;
    const index = displayedPlans.findIndex(
      (p) => (p.category ?? "").toLowerCase() === category.toLowerCase(),
    );
    const target = container.children[index] as HTMLElement | undefined;
    if (index !== -1 && target) {
      container.scrollTo({
        left: target.offsetLeft - container.offsetLeft,
        behavior: "smooth",
      });
    }
  }, [category, displayedPlans]);

  if (!config || plans.length === 0) return null;

  const { labels } = config;
  const exchangeRate = locale?.exchange_rate ?? 1;
  const currencySymbol = locale?.currency_symbol || "$";
  const localCurrency = locale?.currency ?? null;

  const formatPrice = (usd: number) =>
    currency === "USD"
      ? `$${usd}`
      : `${currencySymbol}${(usd * exchangeRate).toFixed(0)}`;

  const substitute = (line: string) =>
    Object.entries(config.featureTokens).reduce(
      (text, [token, value]) => text.replace(new RegExp(`{${token}}`, "g"), value),
      line,
    );

  const buttonLabel = (plan: LandingPlan, baseName: string) =>
    plan.is_free_plan || plan.cost === 0
      ? labels.joinFree
      : plan.trial_period_days && plan.trial_period_days > 0
        ? labels.daysFree(plan.trial_period_days)
        : labels.select(baseName);

  return (
    <section
      id={id || "pricing"}
      className="w-full py-12 md:py-24 lg:py-32 bg-background text-foreground relative"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-2 justify-center flex-wrap mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange?.(cat.id)}
              data-state={category === cat.id ? "active" : "inactive"}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border bg-background text-muted-foreground border-border ${cat.style}`}
            >
              {cat.label}
            </button>
          ))}

          {localCurrency && localCurrency !== "USD" && (
            <div className="relative">
              <button
                onClick={() => setShowCurrencySelector((v) => !v)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors h-[38px]"
              >
                <span>{currency}</span>
                <span className="text-[10px] opacity-70">
                  {currency === "USD"
                    ? labels.global
                    : `~ ${exchangeRate.toFixed(2)}`}
                </span>
                <svg
                  className="w-3 h-3 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showCurrencySelector && (
                <div className="absolute left-1/2 -translate-x-1/2 md:translate-x-0 md:right-0 mt-2 w-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden z-20">
                  {["USD", localCurrency].map((code) => (
                    <button
                      key={code}
                      onClick={() => {
                        setCurrency(code);
                        setShowCurrencySelector(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      {code === "USD" ? "USD ($)" : code}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto flex-nowrap snap-x snap-mandatory gap-6 w-full pb-8 no-scrollbar items-stretch"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {displayedPlans.map((plan) => {
            const baseName = cleanPlanName(plan.plan_name);
            const hasSeats = !!plan.is_per_seat_plan;
            const features = Array.isArray(plan.features) ? plan.features : [];
            const isFree = !!plan.is_free_plan || plan.cost === 0;
            const displayTitle = isFree
              ? baseName.replace(/\s*Free\s*/i, "").trim() || baseName
              : baseName;

            const sibling = (match: (interval?: string) => boolean) =>
              plans.find(
                (p) =>
                  p.category === plan.category &&
                  cleanPlanName(p.plan_name) === baseName &&
                  match(p.billing_interval),
              );
            const yearlyPlan = sibling(isYearly);
            const monthlyPlan = sibling(isMonthly);
            let savingsText = labels.annualBilling;
            if (monthlyPlan && yearlyPlan && !isAnnual) {
              const savings = monthlyPlan.cost * 12 - yearlyPlan.cost;
              if (savings > 0) {
                savingsText = labels.save(
                  `${currencySymbol}${Math.round(savings * exchangeRate)}`,
                );
              }
            }

            return (
              <div
                key={plan.name ?? plan.plan_name}
                className="flex-none w-[85%] md:w-[45%] lg:w-[calc(25%-1.2rem)] snap-center flex flex-col p-6 pt-3 bg-secondary rounded-lg border border-border/50"
              >
                <div className="mb-6 flex flex-col">
                  <h3 className="text-xl font-bold mb-2 text-muted-foreground/70">
                    {displayTitle}
                  </h3>
                  <div className="flex flex-col">
                    <p className="text-4xl font-bold">
                      {isFree ? "Free" : formatPrice(plan.cost)}
                      {!isFree && (
                        <span className="text-base font-normal text-muted-foreground ml-1">
                          {isAnnual
                            ? hasSeats
                              ? "/user/year"
                              : "/year"
                            : hasSeats
                              ? "/user/month"
                              : "/month"}
                        </span>
                      )}
                    </p>
                    {!isFree && currency !== "USD" && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-bold py-0.5 px-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded uppercase tracking-tighter">
                          {labels.approx}
                        </span>
                        <p className="text-xs text-muted-foreground italic tracking-tight">
                          {labels.billedAs(plan.cost)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <ul className="flex flex-col gap-3 text-left mb-8 flex-grow">
                  {features.map((feat, i) => (
                    <li key={i} className="flex items-start">
                      <CheckIcon className="size-4 mr-2 text-wealth-green-500 mt-1 shrink-0" />
                      {/* Feature lines are authored markup from the platform's own plan records. */}
                      <span
                        className="text-sm leading-snug"
                        dangerouslySetInnerHTML={{ __html: substitute(feat) }}
                      />
                    </li>
                  ))}
                </ul>

                <div className="space-y-4 pt-6 border-t border-border/50 mt-auto">
                  <div className="h-10 flex flex-col justify-center">
                    {yearlyPlan ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{savingsText}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAnnual}
                            onChange={() => setIsAnnual((v) => !v)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-muted-foreground/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground after:border after:rounded-full after:size-4 after:transition-all peer-checked:bg-primary" />
                        </label>
                      </div>
                    ) : (
                      <div className="invisible" aria-hidden="true" />
                    )}
                  </div>

                  <div className="h-16 flex flex-col justify-center">
                    {hasSeats ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-muted-foreground uppercase tracking-wider">
                            {labels.seats}
                          </span>
                          <span>{plan.base_user_count ?? 3} total</span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="20"
                          defaultValue={plan.base_user_count ?? 3}
                          className="w-full h-1.5 bg-muted-foreground/20 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                          <span>2</span>
                          <span>5</span>
                          <span>10</span>
                          <span>20</span>
                        </div>
                      </div>
                    ) : (
                      <div className="invisible" aria-hidden="true" />
                    )}
                  </div>

                  <Link
                    href={LANDING_CONFIG.planSignupUrl(plan.plan_name)}
                    className={`block w-full text-center px-4 py-3 rounded-md font-semibold transition-all ${
                      isFree
                        ? "bg-primary/10 hover:bg-primary/20 text-primary"
                        : "text-primary-foreground bg-primary hover:bg-primary/90"
                    }`}
                  >
                    {buttonLabel(plan, baseName)}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center justify-center space-y-4 text-center mt-16">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              {config.ready.heading}
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {config.ready.blurb}
            </p>
          </div>
          <Link
            href={LANDING_CONFIG.planSignupUrl()}
            className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black rounded-md font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            {config.ready.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}

/** The registered form's client half: the plans the page prefetched, the category tab state kept here. */
export function PricingSection({ id, plans }: Pick<PageSectionProps, "id" | "plans">) {
  const [category, setCategory] = useState(
    AGENT_LANDING_CONFIG.pricing?.defaultCategory ?? "",
  );
  return (
    <Pricing
      id={id}
      plans={plans}
      category={category}
      onCategoryChange={setCategory}
    />
  );
}
