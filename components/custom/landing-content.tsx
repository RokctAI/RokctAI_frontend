/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
