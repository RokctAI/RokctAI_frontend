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

// The page PayFast sends a paid-plan sign-up back to (register/paid). The
// hub makes the site and opens the onboarding session only once PayFast
// confirms the payment (Ray 2026-11-27: pay before onboarding), which can
// take a few seconds after the visitor lands here: the page asks every
// three seconds, then shows the email PIN step (./agent-verify-pin-step.tsx),
// then goes on to the home page, as a free sign-up does.

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { paidSignupState, type PaidSignupState } from "@/app/(auth)/agent-paid-signup";
import AgentVerifyPinStep from "@/components/custom/auth/agent-verify-pin-step";
import { HubTheme } from "@/components/custom/hub/hub-theme";
import { tx } from "@/app/lib/i18n/phrases";

const EVERY_MS = 3000;

export default function AgentPaidSignup() {
  const router = useRouter();
  const [state, setState] = useState<PaidSignupState>({ status: "waiting" });

  useEffect(() => {
    let live = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const ask = async () => {
      const next = await paidSignupState();
      if (!live) return;
      setState(next);
      if (next.status === "waiting") timer = setTimeout(ask, EVERY_MS);
    };
    ask();
    return () => {
      live = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const home = useCallback(() => router.replace("/"), [router]);

  if (state.status === "ready") {
    return <AgentVerifyPinStep next={home} skip={home} email={state.email} siteName={null} />;
  }
  return (
    <HubTheme className="hub-card p-6 space-y-4 text-left">
      {state.status === "waiting" && (
        <>
          <h2 className="text-3xl">{tx("Payment received")}</h2>
          <p className="hub-muted">{tx("Setting up your business. This takes a few seconds.")}</p>
        </>
      )}
      {state.status === "cancelled" && (
        <>
          <h2 className="text-3xl">{tx("Payment cancelled")}</h2>
          <p className="hub-muted">{tx("Nothing was charged. You can sign up again any time.")}</p>
          <a className="hub-btn w-full block text-center" href="/register">{tx("Sign up again")}</a>
        </>
      )}
      {state.status === "none" && (
        <>
          <h2 className="text-3xl">{tx("Nothing to finish here")}</h2>
          <p className="hub-muted">{tx("This sign-up has finished, or was started in another browser.")}</p>
          <a className="hub-btn w-full block text-center" href="/login">{tx("Log in")}</a>
        </>
      )}
      {state.status === "failed" && (
        <>
          <h2 className="text-3xl">{tx("Something went wrong")}</h2>
          <p className="hub-muted" role="alert">{state.error}</p>
        </>
      )}
    </HubTheme>
  );
}
