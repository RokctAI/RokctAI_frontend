"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFormState } from "react-dom";
import { useSearchParams, useRouter } from "next/navigation";
import { register, ActionState, getIndustries } from "@/app/(auth)/actions";
import { getSubscriptionPlans } from "@/lib/actions/getSubscriptionPlans";
import { SubmitButton } from "@/components/custom/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Branding } from "@/components/custom/branding";
import { AuthForm } from "@/components/custom/auth-form";
import { Header } from "@/components/custom/header";
import React from "react";
import { PLATFORM_NAME, getGuestBranding, getBrandingSync, VOUCHER_OFFSET_Y } from "@/app/config/platform";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
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
          "Manufacturing", "Retail", "Technology", "Healthcare",
          "Finance", "Education", "Distribution", "Services", "Other"
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

  const [state, formAction] = useFormState<ActionState, FormData>(
    register,
    { status: "idle" },
  );

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        openLoginPopup={() => handleNavigation("/login")}
        openSignupPopup={() => handleNavigation("/register")}
      />

      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Create Account</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Join thousands of companies using <span className="font-bold">{PLATFORM_NAME}</span>
            </p>
          </div>

          <div className="bg-white dark:bg-black/40 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8">
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
                <SubmitButton className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02]">
                  Get Started
                </SubmitButton>
                {state?.status === "failed" && <p className="text-red-500 text-sm text-center">{state.error || "Something went wrong."}</p>}
                {state?.status === "user_exists" && <p className="text-red-500 text-sm text-center">User already exists.</p>}
              </div>
            </AuthForm>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-500">Already have an account? </span>
              <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
