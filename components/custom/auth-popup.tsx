"use client";

import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { login, LoginActionState, register } from "@/app/(auth)/actions";
import { AuthForm } from "@/components/custom/auth-form";
import { SubmitButton } from "@/components/custom/submit-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PLATFORM_NAME } from "@/app/config/platform";
import { Branding } from "./branding";

export function AuthPopup({
  open,
  onOpenChange,
  defaultMode = "login",
  selectedPlan,
  defaultCountry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "login" | "signup";
  selectedPlan?: string | null;
  defaultCountry?: string | null;
}) {
  const [mode, setMode] = useState(defaultMode);
  const [branding, setBranding] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  // Branding is handled by the Branding component
  useEffect(() => {
  }, []);
  const [email, setEmail] = useState("");

  const [loginState, loginAction] = useActionState<LoginActionState, FormData>(login, { status: "idle" });
  const [registerState, registerAction] = useActionState<any, FormData>(register, { status: "idle" });

  const formAction = mode === 'login' ? loginAction : registerAction;
  const state = mode === 'login' ? loginState : registerState;

  useEffect(() => {
    if (state.status === "failed") {
      toast.error("Invalid credentials!");
    } else if (state.status === "invalid_data") {
      toast.error("Failed validating your submission!");
    } else if (state.status === "user_exists") {
      toast.error("A user with this email already exists.");
    } else if (state.status === "success") {
      router.refresh();
      onOpenChange(false);
    }
  }, [state.status, router, onOpenChange]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-200 dark:border-gray-800 shadow-2xl">
        <DialogHeader className="flex flex-col items-center space-y-4 pt-4">
          <div className="text-center space-y-1">
            <DialogTitle className="text-2xl font-bold tracking-tight">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</DialogTitle>
            <DialogDescription className="text-base italic">
              {mode === 'login' ? 'Enter your credentials to access your workspace' : (
                <span>
                  Get started with your free <Branding /> account
                </span>
              )}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="py-2">
          <AuthForm action={handleSubmit} defaultEmail={email} mode={mode} selectedPlan={selectedPlan} defaultCountry={defaultCountry}>
            <SubmitButton className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02]">
              {mode === 'login' ? 'Sign In' : 'Sign Up'}
            </SubmitButton>
          </AuthForm>
        </div>

        <div className="mt-4 flex flex-col items-center space-y-3 text-sm">
          {mode === 'login' ? (
            <p className="text-muted-foreground">
              New to <Branding />?{' '}
              <button onClick={() => setMode('signup')} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline hover:text-indigo-500 transition-colors">
                Create an account
              </button>
            </p>
          ) : (
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline hover:text-indigo-500 transition-colors">
                Sign in
              </button>
            </p>
          )}
          <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Forgot your password?
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
