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

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PLATFORM_NAME, getGuestBranding } from "@/app/config/platform";
import { toast } from "sonner";
import { login, ActionState } from "@/app/(auth)/actions";
import { AuthForm } from "@/components/custom/auth-form";
import { BrandLogo } from "@/components/custom/brand-logo";
import { SubmitButton } from "@/components/custom/submit-button";
import { Header } from "@/components/custom/header";
import React from "react";

export function LoginView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [state, formAction] = useActionState<ActionState, FormData>(login, {
    status: "idle",
  });

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  if (state.status === "success") {
    // Just refresh or let middleware redirect
    router.refresh();
  } else if (state.status === "failed") {
    toast.error("Invalid credentials!");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        openLoginPopup={() => handleNavigation("/login")}
        openSignupPopup={() => handleNavigation("/register")}
      />
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center">
            {/*
              The host's own mark. `components/custom/brand-logo.tsx` is a
              seam every shell already owns (it is in this SDK's manifest
              `requires`), so each product shows its own logo here with no
              per-shell branching in the SDK.
            */}
            <div className="mb-4">
              <BrandLogo width={56} height={56} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome to {PLATFORM_NAME}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-card border border-border backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <AuthForm action={handleSubmit} defaultEmail={email} mode="login">
              <SubmitButton className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02]">
                Sign In
              </SubmitButton>
            </AuthForm>

            {/*
              No "Or continue with" divider: this form ships no OAuth/social
              provider buttons, so the divider labelled an empty list. Bring
              it back in the same commit that adds the first provider button.
            */}
            <div className="mt-6">
              <div className="text-center text-sm">
                <Link
                  href="/register"
                  className="font-semibold text-primary hover:text-primary/80"
                >
                  Create an account
                </Link>
              </div>
              <div className="mt-2 text-center text-xs">
                <Link
                  href={"/forgot" + "-password"}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
