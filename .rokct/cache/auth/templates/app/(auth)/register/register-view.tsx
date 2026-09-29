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
// The host shell's middleware, installed by auth_sdk (NextAuth-gated).
"use client";

// The register page's client half (auth_sdk 1.7.0): the account form with
// the home SDK's words and extra fields, then - once the account exists -
// the home SDK's post-account STEPS, run one after another with a progress
// line and a Skip for every step that allows one (the Dart
// RegistrationStepsPage). The server page (./page.tsx) hands the copy and
// the fields down already resolved; the fields' option loaders and the
// steps themselves, being functions, are read here from the same registry.

import {
  Suspense,
  useEffect,
  useState,
  type ComponentType,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useActionState } from "react";
import { useRouter } from "next/navigation";

import {
  register,
  resendRegistrationCode,
  verifyRegistrationEmail,
  type ActionState,
} from "@/app/(auth)/actions";
import { AuthForm } from "@/components/custom/auth-form";
import {
  loadRegisterConfig,
  type RegisterCopy,
  type RegisterField,
  type RegisterStep,
  type RegisterStepProps,
} from "@/components/custom/auth/register-registry";
import { BrandLogo } from "@/components/custom/brand-logo";
import { Header } from "@/components/custom/header";
import { SubmitButton } from "@/components/custom/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface RegisterViewProps {
  copy: Required<RegisterCopy>;
  /** The config's fields without their option loaders (a server component cannot pass functions). */
  fields: RegisterField[];
  /** Whether the config declares post-account steps; they are loaded here when reached. */
  hasSteps: boolean;
  /** Values for `fromQuery` fields, read from the URL by the server page. */
  prefilled: Record<string, string | null>;
}

/** Card-shaped placeholder matching the form's box, so the page does not jump. */
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
            <div className="h-10 w-full rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** The post-account steps, one at a time. */
function StepRunner({
  steps,
  email,
  siteName,
  onDone,
}: {
  steps: RegisterStep[];
  email: string;
  siteName: string | null;
  onDone: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [Step, setStep] = useState<ComponentType<RegisterStepProps> | null>(null);
  const step = steps[index];

  useEffect(() => {
    if (!step) {
      onDone();
      return;
    }
    let live = true;
    setStep(null);
    step
      .load()
      .then((mod) => {
        if (live) setStep(() => mod.default);
      })
      .catch((error) => {
        console.error(`[auth] register step "${step.id}" failed to load:`, error);
        if (live) setIndex((i) => i + 1);
      });
    return () => {
      live = false;
    };
  }, [step, onDone]);

  if (!step) return null;
  const advance = () => setIndex((i) => i + 1);
  return (
    <div className="bg-card border border-border backdrop-blur-sm rounded-2xl shadow-xl p-8 space-y-6">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {step.label ?? step.id} · {index + 1}/{steps.length}
        </span>
        {(step.skippable ?? true) && (
          <button
            type="button"
            onClick={advance}
            className="font-semibold text-primary hover:text-primary/80"
          >
            Skip
          </button>
        )}
      </div>
      {Step ? (
        <Step next={advance} skip={advance} email={email} siteName={siteName} />
      ) : (
        <div className="h-24 w-full rounded-md bg-muted animate-pulse" />
      )}
    </div>
  );
}

/**
 * The email code step: the site emailed a 6-digit code on sign-up and will
 * not sign the account in until it is entered (api.user.login answers 403
 * "Account not verified"). Checks the code, signs in, then hands back.
 */
function VerifyEmailStep({
  email,
  password,
  siteName,
  message,
  onVerified,
}: {
  email: string;
  password: string;
  siteName: string | null;
  message?: string;
  onVerified: () => void;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const result = await verifyRegistrationEmail({ email, password, code, siteName });
    setBusy(false);
    if (result.status === "success") onVerified();
    else setError(result.error ?? "Could not verify the code.");
  };

  const resend = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    const result = await resendRegistrationCode({ email, siteName });
    setBusy(false);
    if (result.status === "success") setNotice("A new code is on its way.");
    else setError(result.error ?? "Could not send a new code.");
  };

  return (
    <form
      onSubmit={submit}
      className="bg-card border border-border backdrop-blur-sm rounded-2xl shadow-xl p-8 space-y-4"
    >
      <p className="text-sm text-muted-foreground text-center">
        {message ?? `We emailed a verification code to ${email}.`} Enter it
        below to finish creating your account.
      </p>
      <div className="grid gap-2">
        <Label htmlFor="verification_code">Verification code</Label>
        <Input
          id="verification_code"
          name="verification_code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
      </div>
      <button
        type="submit"
        disabled={busy || !code.trim()}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg shadow-md disabled:opacity-60"
      >
        Verify email
      </button>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      {notice && <p className="text-muted-foreground text-sm text-center">{notice}</p>}
      <div className="text-center text-sm">
        <button
          type="button"
          onClick={resend}
          disabled={busy}
          className="font-semibold text-primary hover:text-primary/80 disabled:opacity-60"
        >
          Resend code
        </button>
      </div>
    </form>
  );
}

function RegisterViewInner({ copy, fields, hasSteps, prefilled }: RegisterViewProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  // Held only until the code step signs the new account in.
  const [password, setPassword] = useState("");
  const [verified, setVerified] = useState(false);
  const [liveFields, setLiveFields] = useState<RegisterField[]>(fields);
  const [steps, setSteps] = useState<RegisterStep[]>([]);
  const [state, formAction] = useActionState<ActionState, FormData>(register, {
    status: "idle",
  });

  // The option loaders and the steps are functions the server page could
  // not hand over; read them from the registry here, once.
  useEffect(() => {
    let live = true;
    loadRegisterConfig().then((config) => {
      if (!live) return;
      if (config.fields.some((f) => f.loadOptions)) setLiveFields(config.fields);
      if (hasSteps) setSteps(config.steps);
    });
    return () => {
      live = false;
    };
  }, [hasSteps]);

  const finish = () => router.refresh();

  const handleSubmit = (formData: FormData) => {
    setEmail(((formData.get("email") as string) ?? "").trim());
    setPassword((formData.get("password") as string) ?? "");
    setVerified(false);
    formAction(formData);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const needsCode = state?.status === "verify_email" && !verified;
  const done = state?.status === "success" || (state?.status === "verify_email" && verified);

  const onVerified = () => {
    setPassword("");
    setVerified(true);
    // With no post-account steps there is nothing left here: go on signed in.
    if (steps.length === 0) finish();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        openLoginPopup={() => handleNavigation("/login")}
        openSignupPopup={() => handleNavigation("/register")}
      />

      <div className="flex-1 flex flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center">
            {/*
              The host's own mark, same seam the login page uses:
              components/custom/brand-logo.tsx is in this SDK's manifest
              requires, so each shell shows its own logo with no per-shell
              branching here.
            */}
            <div className="mb-4">
              <BrandLogo width={56} height={56} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {copy.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>
          </div>

          {needsCode ? (
            <VerifyEmailStep
              email={email}
              password={password}
              siteName={state.siteName ?? null}
              message={state.error}
              onVerified={onVerified}
            />
          ) : done && steps.length > 0 ? (
            <StepRunner
              steps={steps}
              email={email}
              siteName={state?.siteName ?? null}
              onDone={finish}
            />
          ) : done ? (
            <div className="bg-card border border-border backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center text-sm text-muted-foreground">
              {verified ? "Your account is ready." : (state.error ?? "Your account is ready.")}
            </div>
          ) : (
            <div className="bg-card border border-border backdrop-blur-sm rounded-2xl shadow-xl p-8">
              <AuthForm
                action={handleSubmit}
                mode="signup"
                extraFields={liveFields}
                prefilled={prefilled}
              >
                <div className="grid gap-2 pt-2">
                  <SubmitButton className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02]">
                    {copy.cta}
                  </SubmitButton>
                  {(state?.status === "failed" || state?.status === "invalid_data") && (
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
                <span className="text-muted-foreground">{copy.signInPrompt} </span>
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:text-primary/80 hover:underline"
                >
                  {copy.signInLabel}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function RegisterView(props: RegisterViewProps) {
  return (
    <Suspense fallback={<RegisterSkeleton />}>
      <RegisterViewInner {...props} />
    </Suspense>
  );
}
