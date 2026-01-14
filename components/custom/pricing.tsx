"use client";

import { Switch } from "@/components/ui/switch";
import { PLATFORM_NAME } from "@/app/config/constants";
import { Branding } from "./branding";
import { CheckIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getSubscriptionPlans } from "@/lib/actions/getSubscriptionPlans";
import { AI_MODELS } from "@/ai/models";

// Define a type for our subscription plan data
type SubscriptionPlan = {
  name: string;
  plan_name: string;
  cost: number;
  billing_interval: string;
  trial_period_days?: number;
  is_per_seat_plan?: number;
  base_user_count?: number;
  currency?: string;
  features?: string[];
  category?: string;
};

export function Pricing({
  openSignupPopup,
  signupUrl,
  category = "rokct",
  onCategoryChange,
  initialPlans
}: {
  openSignupPopup?: (plan?: string, country?: string) => void;
  signupUrl?: (plan?: string) => string;
  category?: string;
  onCategoryChange?: (category: string) => void;
  initialPlans?: any[];
}) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState(!initialPlans || initialPlans.length === 0);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Currency State
  const [plans, setPlans] = useState<any[]>(initialPlans || []);
  const [currency, setCurrency] = useState<string>("USD");
  const [currencySymbol, setCurrencySymbol] = useState<string>("$");
  const [exchangeRate, setExchangeRate] = useState(1.0);
  const [localCurrency, setLocalCurrency] = useState<string | null>(null);
  const [countryName, setCountryName] = useState<string | null>(null);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);

  // Style Mapping for categories
  const CATEGORY_STYLES: Record<string, string> = {
    "rokct": "text-indigo-600 border-indigo-200 dark:text-indigo-400 dark:border-indigo-800 hover:border-indigo-500 hover:text-indigo-500 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:border-indigo-600 dark:data-[state=active]:bg-indigo-400 dark:data-[state=active]:text-black dark:data-[state=active]:border-indigo-400",
    "telephony": "text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800 hover:border-blue-500 hover:text-blue-500 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 dark:data-[state=active]:bg-blue-400 dark:data-[state=active]:text-black dark:data-[state=active]:border-blue-400",
    "hosting": "text-orange-600 border-orange-200 dark:text-orange-400 dark:border-orange-800 hover:border-orange-500 hover:text-orange-500 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:border-orange-600 dark:data-[state=active]:bg-orange-400 dark:data-[state=active]:text-black dark:data-[state=active]:border-orange-400",
    "lending": "text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800 hover:border-emerald-500 hover:text-indigo-500 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:border-emerald-600 dark:data-[state=active]:bg-emerald-400 dark:data-[state=active]:text-black dark:data-[state=active]:border-emerald-400",
    "paas": "text-teal-600 border-teal-200 dark:text-teal-400 dark:border-teal-800 hover:border-teal-500 hover:text-indigo-500 data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:border-teal-600 dark:data-[state=active]:bg-teal-400 dark:data-[state=active]:text-black dark:data-[state=active]:border-teal-400",
  };

  // Dynamically derive categories from plans
  const dynamicCategories = React.useMemo(() => {
    const catsFound = new Set<string>();
    plans.forEach(p => {
      if (p.category && p.category.toLowerCase() !== 'lms') {
        catsFound.add(p.category);
      }
    });

    const list = Array.from(catsFound).map(cat => ({
      id: cat,
      label: cat === 'rokct' ? 'ROKCT/ERP' : (cat.charAt(0).toUpperCase() + cat.slice(1)),
      color: CATEGORY_STYLES[cat.toLowerCase()] || "text-slate-600 border-slate-200 hover:border-slate-500 hover:text-slate-500 data-[state=active]:bg-slate-600 data-[state=active]:text-white dark:text-slate-400 dark:border-slate-800"
    }));

    // Ensure ROKCT is always first
    return list.sort((a, b) => {
      if (a.id.toLowerCase() === 'rokct') return -1;
      if (b.id.toLowerCase() === 'rokct') return 1;
      return a.label.localeCompare(b.label);
    });
  }, [plans]);

  useEffect(() => {
    console.log("Pricing Component Loaded: Version 1.0 SafeCode");
    const initData = async () => {
      // If we already have plans (prefetched), just load metadata
      if (plans.length === 0) {
        setLoading(true);
        setError(null);
        try {
          // Fetch All Plans (no filtering)
          const response = await getSubscriptionPlans();

          if (!response.success || !response.data) {
            throw new Error(response.error || "Failed to fetch plans");
          }

          setPlans(response.data);
        } catch (err: any) {
          console.error("Failed to load pricing data:", err);
          setError(err.message || "Failed to load subscription plans.");
          setLoading(false);
          return;
        }
      }
      setLoading(false);

      try {
        // Fetch Pricing Metadata
        const { getPricingMetadata } = await import("@/lib/actions/getPricingMetadata");
        const metadata = await getPricingMetadata();

        if (metadata) {
          console.log(`[Pricing] Localizing to ${metadata.currency} (Rate: ${metadata.exchange_rate}, Country: ${metadata.country_name}, IP: ${metadata.ip})`);
          setCurrency(metadata.currency);
          setLocalCurrency(metadata.currency);
          setExchangeRate(metadata.exchange_rate);
          if (metadata.currency_symbol) setCurrencySymbol(metadata.currency_symbol);
          if (metadata.country_name) setCountryName(metadata.country_name);
        }
      } catch (err) {
        console.log("Metadata fetch failed", err);
      }
    };

    initData();
  }, []); // Run once on mount

  const formatPrice = (usdCost: number) => {
    if (currency === "USD") return `$${usdCost}`;
    const localCost = (usdCost * exchangeRate).toFixed(0);
    return `${currencySymbol}${localCost}`;
  };

  const toggleCurrency = (target: string) => {
    if (target === "USD") {
      setCurrency("USD");
    } else if (localCurrency) {
      setCurrency(localCurrency);
    }
    setShowCurrencySelector(false);
  }

  const displayedPlans = plans.filter(plan => {
    if (plan.category?.toLowerCase() === 'lms') return false;
    // Hide free plans specifically for the ROKCT category as requested
    if (plan.category?.toLowerCase() === 'rokct' && plan.cost === 0) return false;

    if (isAnnual) return plan.plan_name.includes('Yearly');
    return plan.plan_name.includes('Monthly');
  }).sort((a, b) => {
    // 1. Group by Category (Match the Button Order)
    const catA = a.category?.toLowerCase() || '';
    const catB = b.category?.toLowerCase() || '';

    // Find index in the config array
    const indexA = dynamicCategories.findIndex(c => c.id.toLowerCase() === catA);
    const indexB = dynamicCategories.findIndex(c => c.id.toLowerCase() === catB);

    // If both are known categories, sort by their defined order
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    // If only one is known, put it first (or last? usually known first)
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    // 2. Fallback: Sort by Cost for unknown categories
    return (a.cost || 0) - (b.cost || 0);
  });

  // Scroll to category logic
  useEffect(() => {
    if (!category || displayedPlans.length === 0 || !scrollContainerRef.current) return;

    // Find first plan matching the category (case-insensitive)
    const targetIndex = displayedPlans.findIndex(p => p.category?.toLowerCase() === category.toLowerCase());

    if (targetIndex !== -1) {
      const container = scrollContainerRef.current;
      const targetElement = container.children[targetIndex] as HTMLElement;

      if (targetElement) {
        const x = targetElement.offsetLeft - container.offsetLeft;
        container.scrollTo({
          left: x,
          behavior: 'smooth'
        });
      }
    }
  }, [category, displayedPlans]);


  if (loading) {
    return (
      <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-background text-foreground">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p>Loading pricing...</p>
        </div>
      </section>
    );
  }

  if (error) {
    // Only show error details if debug mode is enabled
    const isDebug = typeof window !== 'undefined' && localStorage.getItem('rokct_debug_mode') === 'true';

    if (!isDebug) {
      // Silenced error state: just return null or a generic loading skeleton that never resolves?
      // Or better, return an empty section or generic "Contact Sales" fallback?
      // Since it's a section on a landing page, hiding it entirely is safer if it fails,
      // or showing a "Contact us for pricing" card.
      // Let's hide it to "silence it".
      return null;
    }

    return (
      <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-background text-foreground">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 max-w-md mx-auto">
            <p className="font-semibold">Unable to load pricing (Debug Mode)</p>
            <p className="text-sm mt-1 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/70 rounded-md text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  const cleanPlanName = (name: any) => {
    if (typeof name !== 'string' || !name) return "Unknown Plan";
    let cleaned = name.replace(/\s*\(.*\)\s*/, '');
    // Replace dots, underscores, and hyphens with single space
    cleaned = cleaned.replace(/[._\-\s]+/g, ' ');
    // Remove Monthly/Yearly
    cleaned = cleaned.replace(/\s*(Monthly|Yearly)\s*/i, '');
    // Handle dangling hyphens if any remained (fallback)
    cleaned = cleaned.replace(/-+$/, '');
    return cleaned.trim() || "Unknown Plan";
  };

  return (
    <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-background text-foreground relative">
      <div className="container mx-auto px-4 md:px-6">

        {/* Category Buttons derived from plans */}
        <div className="flex items-center gap-2 justify-center flex-wrap mb-8">
          {dynamicCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange && onCategoryChange(cat.id)}
              data-state={category === cat.id ? "active" : "inactive"}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border bg-background text-muted-foreground border-border ${cat.color}`}
            >
              {cat.label}
            </button>
          ))}

          {/* Currency Selector Badge - Inline with Categories */}
          {localCurrency && localCurrency !== "USD" && (
            <div className="relative">
              <button
                onClick={() => setShowCurrencySelector(!showCurrencySelector)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors h-[38px]"
              >
                <span>{currency}</span>
                <span className="text-[10px] opacity-70">
                  {currency === "USD" ? "Global" : `~ ${exchangeRate.toFixed(2)}`}
                </span>
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>

              {showCurrencySelector && (
                <div className="absolute left-1/2 -translate-x-1/2 md:translate-x-0 md:right-0 mt-2 w-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden z-20">
                  <button onClick={() => { toggleCurrency("USD"); setShowCurrencySelector(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                    USD ($)
                  </button>
                  <button onClick={() => { toggleCurrency(localCurrency); setShowCurrencySelector(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                    {localCurrency}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>


        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto flex-nowrap snap-x snap-mandatory gap-6 w-full pb-8 no-scrollbar items-stretch"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayedPlans.map((plan) => {
            const baseName = cleanPlanName(plan.plan_name);
            const hasSeats = !!plan.is_per_seat_plan;
            const features = Array.isArray(plan.features) ? plan.features : [];

            return (
              <div
                key={plan.plan_name || Math.random()}
                className="flex-none w-[85%] md:w-[45%] lg:w-[calc(25%-1.2rem)] snap-center flex flex-col p-6 pt-3 bg-secondary rounded-lg border border-border/50"
              >
                <div className="mb-6 flex flex-col">
                  {(() => {
                    let displayTitle = baseName;
                    if (plan.cost === 0) {
                      displayTitle = (baseName.replace ? baseName.replace(/\s*Free\s*/i, '') : baseName).trim();
                      if (!displayTitle || displayTitle.toLowerCase() === 'rokct') {
                        displayTitle = "ROKCT";
                      }
                    }
                    return <h3 className="text-xl font-bold mb-2 text-muted-foreground/70">{displayTitle}</h3>;
                  })()}
                  <div className="flex flex-col">
                    <p className="text-4xl font-bold">
                      {plan.cost === 0 ? "Free" : formatPrice(plan.cost)}
                      {plan.cost > 0 && (
                        <span className="text-base font-normal text-muted-foreground ml-1">
                          {isAnnual ? (hasSeats ? "/user/year" : "/year") : (hasSeats ? "/user/month" : "/month")}
                        </span>
                      )}
                    </p>
                    {plan.cost > 0 && currency !== "USD" && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-bold py-0.5 px-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded uppercase tracking-tighter">
                          Approx.
                        </span>
                        <p className="text-xs text-muted-foreground italic tracking-tight">Billed as ${plan.cost} USD</p>
                      </div>
                    )}
                  </div>
                </div>

                <ul className="flex flex-col gap-3 text-left mb-8 flex-grow">
                  {features.map((feat, i) => {
                    // Dynamic replacement: {model} -> formatted model name
                    const modelName = AI_MODELS.PAID.id.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
                    const cleanFeat = feat.replace(/{model}/g, modelName);

                    return (
                      <li key={i} className="flex items-start">
                        <CheckIcon className="size-4 mr-2 text-wealth-green-500 mt-1 shrink-0" />
                        <span className="text-sm leading-snug" dangerouslySetInnerHTML={{ __html: cleanFeat }} />
                      </li>
                    );
                  })}
                </ul>

                <div className="space-y-4 pt-6 border-t border-border/50 mt-auto">
                  {/* Annual Toggle for relevant plans */}
                  {(() => {
                    const yearlyPlan = plans.find(p =>
                      p.category === plan.category &&
                      cleanPlanName(p.plan_name) === baseName &&
                      (p.billing_interval?.toLowerCase() === 'year' || p.billing_interval?.toLowerCase() === 'yearly')
                    );
                    const monthlyPlan = plans.find(p =>
                      p.category === plan.category &&
                      cleanPlanName(p.plan_name) === baseName &&
                      (p.billing_interval?.toLowerCase() === 'month' || p.billing_interval?.toLowerCase() === 'monthly')
                    );

                    let savingsText = "Annual Billing";
                    if (monthlyPlan && yearlyPlan) {
                      const savings = (monthlyPlan.cost * 12) - yearlyPlan.cost;
                      if (savings > 0 && !isAnnual) {
                        const localSavings = Math.round(savings * exchangeRate);
                        const symbol = currencySymbol;
                        savingsText = `Save ${symbol}${localSavings}/yr!`;
                      }
                    }

                    const hasAnnualOption = !!yearlyPlan;

                    return (
                      <div className="h-10 flex flex-col justify-center">
                        {hasAnnualOption ? (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {savingsText}
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" checked={isAnnual} onChange={() => setIsAnnual(!isAnnual)} className="sr-only peer" />
                              <div className="w-10 h-5 bg-muted-foreground/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground after:border after:rounded-full after:size-4 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                          </div>
                        ) : (
                          <div className="invisible" aria-hidden="true" />
                        )}
                      </div>
                    );
                  })()}

                  {/* Seat Slider - Reserved Space */}
                  <div className="h-16 flex flex-col justify-center">
                    {hasSeats ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-muted-foreground uppercase tracking-wider">Seats</span>
                          <span>3 total</span>
                        </div>
                        <input type="range" min="2" max="20" defaultValue="3" className="w-full h-1.5 bg-muted-foreground/20 rounded-lg appearance-none cursor-pointer accent-primary" />
                        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                          <span>2</span><span>5</span><span>10</span><span>20</span>
                        </div>
                      </div>
                    ) : (
                      <div className="invisible" aria-hidden="true" />
                    )}
                  </div>

                  {signupUrl ? (
                    <Link
                      href={signupUrl(plan.plan_name)}
                      className={`block w-full text-center px-4 py-3 rounded-md font-semibold transition-all ${plan.is_free_plan || plan.cost === 0
                        ? 'bg-primary/10 hover:bg-primary/20 text-primary'
                        : 'text-primary-foreground bg-primary hover:bg-primary/90'
                        }`}
                    >
                      {plan.is_free_plan || plan.cost === 0 ? 'Join for Free' : (plan.trial_period_days && plan.trial_period_days > 0 ? `${plan.trial_period_days} Days Free` : `Select ${baseName}`)}
                    </Link>
                  ) : (
                    <button
                      onClick={() => openSignupPopup && openSignupPopup(plan.plan_name, countryName || undefined)}
                      className={`w-full px-4 py-3 rounded-md font-semibold transition-all ${plan.is_free_plan || plan.cost === 0
                        ? 'bg-primary/10 hover:bg-primary/20 text-primary'
                        : 'text-primary-foreground bg-primary hover:bg-primary/90'
                        }`}
                    >
                      {plan.is_free_plan || plan.cost === 0 ? 'Join for Free' : (plan.trial_period_days && plan.trial_period_days > 0 ? `${plan.trial_period_days} Days Free` : `Select ${baseName}`)}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center justify-center space-y-4 text-center mt-16">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Ready to get started?
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join the other 59,239+ clients who work faster with <span className="font-bold">{PLATFORM_NAME}</span>.
            </p>
          </div>
          {signupUrl ? (
            <Link href={signupUrl()} className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black rounded-md font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
              Start Free Trial
            </Link>
          ) : (
            <button className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black rounded-md font-semibold">
              Start Free Trial
            </button>
          )}
        </div>
      </div>
    </section >
  );
}
