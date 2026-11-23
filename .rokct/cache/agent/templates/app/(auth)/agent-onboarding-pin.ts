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
"use server";

// The register page's "Verify your email" step, server half. The hub emailed
// a 6-digit code when it opened the onboarding session (control#272
// send_pin); these actions check it and send a new one through the hub's
// guest cmds control:onboarding_state, control:onboarding_verify_pin and
// control:onboarding_resend_pin. The session is the httpOnly cookie
// ./agent-onboarding-session.ts keeps. Caller:
// components/custom/auth/agent-verify-pin-step.tsx.
//
// The gateway answer is read directly (one API: the same POST of {cmd,
// payload} platformCall makes) because the hub's own words ("That code
// isn't right. 2 tries left.") are what the visitor needs to see, and
// platformCall drops them.

import { PLATFORM_GATEWAY_PATH } from "@/app/services/base/platform-gateway";
import { readOnboardingToken } from "@/app/(auth)/agent-onboarding-session";

export type PinState =
  | { status: "none" }
  | { status: "verified" }
  | { status: "waiting" }
  | { status: "sent"; resendAfter: number }
  | { status: "error"; error: string };

const GENERIC = "We could not reach the sign-up service. Try again in a moment.";

async function hub(cmd: string, payload: Record<string, unknown>): Promise<{ ok: boolean; data?: any; error?: string }> {
  const base = process.env.ROKCT_BASE_URL;
  if (!base) return { ok: false, error: GENERIC };
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}${PLATFORM_GATEWAY_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ cmd, payload }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const error = typeof body?.error === "string" && res.status < 500 ? body.error : GENERIC;
      return { ok: false, error };
    }
    return { ok: true, data: body && typeof body === "object" && "message" in body ? body.message : body?.data };
  } catch {
    return { ok: false, error: GENERIC };
  }
}

/** Whether this visitor has a hub session to verify, and if it is done already. */
export async function onboardingPinState(): Promise<PinState> {
  const token = await readOnboardingToken();
  if (!token) return { status: "none" };
  const out = await hub("control:onboarding_state", { session_token: token });
  if (!out.ok) return { status: "error", error: out.error ?? GENERIC };
  return out.data?.email_verified ? { status: "verified" } : { status: "waiting" };
}

export async function verifyOnboardingPin(pin: string): Promise<PinState> {
  const token = await readOnboardingToken();
  if (!token) return { status: "none" };
  const code = (pin || "").replace(/\D/g, "");
  if (code.length !== 6) return { status: "error", error: "Enter the 6-digit code from your email." };
  const out = await hub("control:onboarding_verify_pin", { session_token: token, pin: code });
  if (!out.ok) return { status: "error", error: out.error ?? GENERIC };
  return { status: "verified" };
}

export async function resendOnboardingPin(): Promise<PinState> {
  const token = await readOnboardingToken();
  if (!token) return { status: "none" };
  const out = await hub("control:onboarding_resend_pin", { session_token: token });
  if (!out.ok) return { status: "error", error: out.error ?? GENERIC };
  if (out.data?.verified) return { status: "verified" };
  return { status: "sent", resendAfter: Number(out.data?.resend_after) || 60 };
}
