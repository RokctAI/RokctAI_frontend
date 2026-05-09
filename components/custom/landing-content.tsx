"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/custom/header";
import { Hero } from "@/components/custom/hero";
import { Pricing } from "@/components/custom/pricing";
import { Features } from "@/components/custom/features";
import { AIModels } from "@/components/custom/ai-models";
import { useState } from "react";

export function LandingContent({ plans }: { plans: any[] }) {
  const router = useRouter();
  const [category, setCategory] = useState("rokct");

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <Header loginUrl="/login" signupUrl="/register" />
      <main className="flex-1">
        <Hero signupUrl="/register" />
        <Features />
        <AIModels />
        <Pricing
          signupUrl={(plan) => (plan ? `/register?plan=${plan}` : "/register")}
          category={category}
          onCategoryChange={setCategory}
          initialPlans={plans}
        />
      </main>
    </div>
  );
}
