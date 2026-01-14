"use client";

import { cn } from "@/lib/utils";
import { PLATFORM_NAME } from "@/app/config/platform";

interface CategorySelectorProps {
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

type ShowcaseItem = { label: string; url: string; className?: string };
type FeatureData = { features: string[]; showcase?: ShowcaseItem[] };

const categoryFeatures: Record<string, FeatureData> = {
    rokct: { features: ["CRM", "Accounting", "HRMS", "Project Management", "Payroll", "Productivity"] },
    Telephony: { features: ["Virtual Landlines", "Airtime"] },
    Hosting: { features: ["rPanel", "Websites", "Email", "SSL Certificates"] },
    lending: { features: ["Loan Management", "NCR Compliant", "Decision Engine"] },
    paas: {
        features: ["Delivery Platform", "White Label", "Mobile Apps"],
        showcase: [
            { label: "JUVO Platforms", url: "https://juvo.app", className: "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/40 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300" },
            { label: "FAAVO Kenya", url: "https://faavo.co.ke" }
        ]
    },
};


const categories = [
    {
        id: "rokct",
        label: "ROKCT/ERP",
        color: "text-indigo-600 border-indigo-200 dark:text-indigo-400 dark:border-indigo-800 hover:border-indigo-500 hover:text-indigo-500 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:border-indigo-600 dark:data-[state=active]:bg-indigo-400 dark:data-[state=active]:text-black dark:data-[state=active]:border-indigo-400",
        featureStyle: "border-indigo-200 bg-indigo-500/20 text-indigo-700 dark:bg-indigo-400 dark:text-black dark:border-indigo-400"
    },
    {
        id: "Telephony",
        label: "Telephony",
        color: "text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800 hover:border-blue-500 hover:text-blue-500 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 dark:data-[state=active]:bg-blue-400 dark:data-[state=active]:text-black dark:data-[state=active]:border-blue-400",
        featureStyle: "border-blue-200 bg-blue-500/20 text-blue-700 dark:bg-blue-400 dark:text-black dark:border-blue-400"
    },
    {
        id: "Hosting",
        label: "Hosting",
        color: "text-orange-600 border-orange-200 dark:text-orange-400 dark:border-orange-800 hover:border-orange-500 hover:text-orange-500 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:border-orange-600 dark:data-[state=active]:bg-orange-400 dark:data-[state=active]:text-black dark:data-[state=active]:border-orange-400",
        featureStyle: "border-orange-200 bg-orange-500/20 text-orange-700 dark:bg-orange-400 dark:text-black dark:border-orange-400"
    },
    {
        id: "lending",
        label: "Lending",
        color: "text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800 hover:border-emerald-500 hover:text-emerald-500 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:border-emerald-600 dark:data-[state=active]:bg-emerald-400 dark:data-[state=active]:text-black dark:data-[state=active]:border-emerald-400",
        featureStyle: "border-emerald-200 bg-emerald-500/20 text-emerald-700 dark:bg-emerald-400 dark:text-black dark:border-emerald-400"
    },
    {
        id: "paas",
        label: "PaaS",
        color: "text-teal-600 border-teal-200 dark:text-teal-400 dark:border-teal-800 hover:border-teal-500 hover:text-teal-500 data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:border-teal-600 dark:data-[state=active]:bg-teal-400 dark:data-[state=active]:text-black dark:data-[state=active]:border-teal-400",
        featureStyle: "border-teal-200 bg-teal-500/20 text-teal-700 dark:bg-teal-400 dark:text-black dark:border-teal-400"
    }
];

export function CategorySelector({ selectedCategory, onSelectCategory }: CategorySelectorProps) {
    const activeData = categoryFeatures[selectedCategory] || { features: [] };
    const { features, showcase } = activeData;
    const activeConfig = categories.find(c => c.id === selectedCategory);

    return (
        <div className="w-full flex flex-col items-center justify-center py-4 bg-background border-b transition-all duration-300">
            <p className="mb-4 text-gray-400 dark:text-gray-500 text-center text-sm">
                Or experience one of these
            </p>
            <div className="flex items-center gap-2 justify-center flex-wrap px-4 mb-6">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => onSelectCategory(cat.id)}
                        data-state={selectedCategory === cat.id ? "active" : "inactive"}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                            "bg-background text-muted-foreground border-border",
                            cat.color
                        )}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {(features.length > 0 || (showcase && showcase.length > 0)) && (
                <div key={selectedCategory} className="flex flex-col items-center gap-4 px-4 max-w-4xl animate-in fade-in slide-in-from-top-4 duration-500 fill-mode-both">
                    {features.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-4">
                            {features.map((feature, idx) => (
                                <div key={`feat-${idx}`} className={cn(
                                    "px-6 py-3 rounded-xl border text-sm font-medium shadow-sm backdrop-blur-sm cursor-default transition-colors",
                                    categories[idx % categories.length].featureStyle
                                )}>
                                    {feature}
                                </div>
                            ))}
                        </div>
                    )}

                    {showcase && showcase.length > 0 && (
                        <>
                            <div className="w-full text-center pt-8 pb-4">
                                <span className="text-base text-muted-foreground">
                                    some of the platforms using our <span className="font-extrabold text-foreground">{PLATFORM_NAME}</span> PaaS
                                </span>
                            </div>
                            <div className="flex flex-wrap justify-center gap-6">
                                {showcase.map((item, idx) => (
                                    <a
                                        key={`show-${idx}`}
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            "px-10 py-6 rounded-2xl text-lg font-bold shadow-xl transition-all hover:scale-105",
                                            "bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-800 dark:to-zinc-950",
                                            "border border-border/50 text-foreground cursor-pointer block no-underline",
                                            item.className
                                        )}
                                    >
                                        {item.label}
                                    </a>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
