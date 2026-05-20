"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/custom/header";
import { Hero } from "@/components/custom/hero";
import { Logos } from "@/components/custom/logos";
import { Pricing } from "@/components/custom/pricing";
import { Features } from "@/components/custom/features";
import { AIModels } from "@/components/custom/ai-models";
import { FloatingNav } from "@/components/custom/floating-nav";
import { useState } from "react";

export function LandingContent({ plans, session }: { plans: any[], session?: any }) {
  const router = useRouter();
  const [category, setCategory] = useState("rokct");

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <Header loginUrl="/login" signupUrl="/register" session={session} />
      <main className="flex-1">
        <FloatingNav />
        <Hero id="hero" signupUrl="/register" />
        <Logos />

        {/* Placeholder Sections for Navigation */}
        <div id="extension" className="h-[20vh] border-t border-transparent" />
        <div id="chat" className="h-[20vh] border-t border-transparent" />
        <div id="projects" className="h-[20vh] border-t border-transparent" />
        <div id="crafts" className="h-[20vh] border-t border-transparent" />
        <div id="research" className="h-[20vh] border-t border-transparent" />
        <div id="social" className="h-[20vh] border-t border-transparent" />

        <Features id="features" />

        <div id="security" className="h-[20vh] border-t border-transparent" />
        <div id="devices" className="h-[20vh] border-t border-transparent" />
        <div id="workflow" className="h-[20vh] border-t border-transparent" />

        <AIModels id="ai-models" />

        <Pricing
          id="pricing"
          signupUrl={(plan) => (plan ? `/register?plan=${plan}` : "/register")}
          category={category}
          onCategoryChange={setCategory}
          initialPlans={plans}
        />

        <div id="faq" className="h-[50vh] flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/50">
           <h2 className="text-2xl font-bold opacity-50">FAQ Section Placeholder</h2>
        </div>

        <div id="footer" />
      </main>
    </div>
  );
}
