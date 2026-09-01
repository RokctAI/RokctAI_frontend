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

import { useRouter } from "next/navigation";
import { Header } from "@/components/custom/header";
import { Hero } from "@/components/custom/hero";
import { Logos } from "@/components/custom/logos";
import { Pricing } from "@/components/custom/pricing";
import { CopiedPricing } from "@/components/custom/copied-pricing";
import { FloatingNav } from "@/components/custom/floating-nav";

import { AllFeaturesSection } from "@/components/custom/all-features-section";
import { ChatSection } from "@/components/custom/chat-section";
import { SocialSection } from "@/components/custom/social-section";

import { WorkflowSection } from "@/components/custom/workflow-section";

import { FaqSection } from "@/components/custom/faq-section";
import { TestimonialsSection } from "@/components/custom/testimonials-section";
import { useState } from "react";

export function LandingContent({
  plans,
  session,
}: {
  plans: any[];
  session?: any;
}) {
  const router = useRouter();
  const [category, setCategory] = useState("rokct");
  const [searchActive, setSearchActive] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <Header loginUrl="/login" signupUrl="/register" session={session} />
      <main className="flex-1">
        <FloatingNav />
        <Hero
          id="hero"
          signupUrl="/register"
          onResultsChange={setSearchActive}
        />
        <div style={{ display: searchActive ? "none" : undefined }}>
          <Logos />

          <ChatSection id="chat" />
          {/* Empty anchor divs for FloatingNav sections contained within ChatSection */}
          <div id="projects" />
          <div id="crafts" />
          <div id="research" />

          <SocialSection id="social" />
          <AllFeaturesSection id="features" />

          <WorkflowSection id="workflow" />

          <Pricing
            id="pricing-original"
            signupUrl={(plan) =>
              plan ? `/register?plan=${plan}` : "/register"
            }
            category={category}
            onCategoryChange={setCategory}
            initialPlans={plans}
          />

          <CopiedPricing id="pricing" />

          <FaqSection id="faq" />

          <TestimonialsSection id="testimonials" />
        </div>
        <div id="footer" />
      </main>
    </div>
  );
}
