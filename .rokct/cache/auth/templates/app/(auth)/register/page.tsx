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

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useFormState } from "react-dom";
import { useSearchParams, useRouter } from "next/navigation";
import { register, ActionState, getIndustries } from "@/app/(auth)/actions";
import { getSubscriptionPlans } from "@/lib/actions/getSubscriptionPlans";
import { SubmitButton } from "@/components/custom/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Branding } from "@/components/custom/branding";
import { AuthForm } from "@/components/custom/auth-form";
import { BrandLogo } from "@/components/custom/brand-logo";
import { Header } from "@/components/custom/header";
import React from "react";
import {
  PLATFORM_NAME,
  getGuestBranding,
  getBrandingSync,
  VOUCHER_OFFSET_Y,
} from "@/app/config/platform";

/**
 * The ONLY thing on this page that reads useSearchParams().
 *
 * useSearchParams() in a client component makes Next bail the enclosing
 * Suspense boundary out to client rendering during static prerendering:
 * the boundary's fallback is all that reaches the HTML. When the whole page
 * sat inside that boundary (and the fallback was `null`), /register shipped
 * a literally empty document - no <form>, no <input>, nothing until the JS
 * bundle executed.
 *
 * Confining the hook to this null-rendering leaf confines the bailout to it,
 * so the registration form itself server-renders as ordinary HTML.
 */
function PlanFromQuery({ onPlan }: { onPlan: (plan: string | null) => void }) {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

  useEffect(() => {
    onPlan(plan);
  }, [plan, onPlan]);

  return null;
}

/** Card-shaped placeholder, matching the real card's box so the page does
 *  not jump. It is a safety net only: nothing in RegisterPageInner suspends
 *  today, but a future hook that bails to client rendering would land here
 *  instead of blanking the route again. */
function RegisterSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center">
            <div className="h-9 w-56 rounded-md bg-muted animate-pulse" />
            <div className="mt-3 h-4 w-64 rounded bg-muted animate-pulse" />
          </div>
          <div className="bg-card border border-border rounded-2xl shadow-xl p-8 space-y-4">
            <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
            <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
            <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
            <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

function RegisterPageInner() {
  const router = useRouter();
  const [plan, setPlan] = useState<string | null>(null);
  const [industries, setIndustries] = useState<string[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isServicePlan, setIsServicePlan] = useState(false);
  const [showVoucher, setShowVoucher] = useState(false);
  const [branding, setBranding] = useState<any>(null);

  useEffect(() => {
    async function loadIndustries() {
      const list = await getIndustries();
      if (list && list.length > 0) {
        setIndustries(list);
      } else {
        // Fallback defaults if fetch fails or returns empty
        setIndustries([
          "Manufacturing",
          "Retail",
          "Technology",
          "Healthcare",
          "Finance",
          "Education",
          "Distribution",
          "Services",
          "Other",
        ]);
      }
    }
    loadIndustries();

    // Load branding data safely after mount
    const cached = getBrandingSync();
    if (cached) setBranding(cached);
    getGuestBranding().then(setBranding);

    // Fetch plans
    getSubscriptionPlans().then((data) => {
      if (Array.isArray(data)) setPlans(data);
    });
  }, []);

  const [state, formAction] = useFormState<ActionState, FormData>(register, {
    status: "idle",
  });

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={null}>
        <PlanFromQuery onPlan={setPlan} />
      </Suspense>

      <Header
        openLoginPopup={() => handleNavigation("/login")}
        openSignupPopup={() => handleNavigation("/register")}
      />

      <div className="flex-1 flex flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            {/*
              The host's own mark, same seam the login page uses:
              `components/custom/brand-logo.tsx` is in this SDK's manifest
              `requires`, so each shell shows its own logo with no
              per-shell branching here.
            */}
            <div className="mb-4">
              <BrandLogo width={56} height={56} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Create Account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Join thousands of companies using{" "}
              <span className="font-bold">{PLATFORM_NAME}</span>
            </p>
          </div>

          <div className="bg-card border border-border backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <AuthForm
              action={formAction}
              mode="signup"
              selectedPlan={plan}
              defaultCountry={branding?.countryName || ""}
              industries={industries}
              isServicePlan={isServicePlan}
              onServicePlanChange={setIsServicePlan}
              plans={plans}
            >
              <div className="grid gap-2 pt-2">
                <SubmitButton className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02]">
                  Get Started
                </SubmitButton>
                {state?.status === "failed" && (
                  <p className="text-red-500 text-sm text-center">
                    {state.error || "Something went wrong."}
                  </p>
                )}
                {state?.status === "user_exists" && (
                  <p className="text-red-500 text-sm text-center">
                    User already exists.
                  </p>
                )}
              </div>
            </AuthForm>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?{" "}
              </span>
              <Link
                href="/login"
                className="font-semibold text-primary hover:text-primary/80 hover:underline"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterSkeleton />}>
      <RegisterPageInner />
    </Suspense>
  );
}
