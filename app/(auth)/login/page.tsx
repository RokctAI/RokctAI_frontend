"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PLATFORM_NAME, getGuestBranding } from "@/app/config/platform";
import { toast } from "sonner";
import { login, ActionState } from "@/app/(auth)/actions";
import { AuthForm } from "@/components/custom/auth-form";
import { SubmitButton } from "@/components/custom/submit-button";
import { Header } from "@/components/custom/header";
import React from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [state, formAction] = useActionState<ActionState, FormData>(login, { status: "idle" });

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
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 bg-gradient-to-tr from-indigo-500 to-purple-500 p-3 rounded-xl shadow-lg">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Welcome to {PLATFORM_NAME}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sign in to your account to continue
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white dark:bg-black/40 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8">
            <AuthForm action={handleSubmit} defaultEmail={email} mode="login">
              <SubmitButton className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2.5 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:from-indigo-700 hover:to-purple-700">
                Sign In
              </SubmitButton>
            </AuthForm>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white dark:bg-black px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 text-center text-sm">
                <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                  Create an account
                </Link>
              </div>
              <div className="mt-2 text-center text-xs">
                <Link href="/forgot-password" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-300">
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
