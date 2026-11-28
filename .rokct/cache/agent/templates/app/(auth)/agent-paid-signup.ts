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

// The return page after PayFast (register/paid): asks the hub how the held
// sign-up is going (control:payfast_signup_status, guest, by the claim the
// provisioner kept). Once PayFast has confirmed and the hub has made the
// site, the hub hands over the onboarding session once: it is kept like a
// free sign-up's, and the page moves on to the email PIN step.

import { PLATFORM_GATEWAY_PATH } from "@/app/services/base/platform-gateway";
import {
  forgetPaymentClaim,
  readPaymentClaim,
  rememberOnboardingToken,
} from "@/app/(auth)/agent-onboarding-session";

export type PaidSignupState =
  | { status: "none" }
  | { status: "waiting" }
  | { status: "ready"; email: string }
  | { status: "cancelled" }
  | { status: "failed"; error: string };

const GENERIC = "We could not set up your business. Our team has been told; please contact support.";

export async function paidSignupState(): Promise<PaidSignupState> {
  const claim = await readPaymentClaim();
  const base = process.env.ROKCT_BASE_URL;
  if (!claim || !base) return { status: "none" };
  let data: any = null;
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}${PLATFORM_GATEWAY_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ cmd: "control:payfast_signup_status", payload: { claim } }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) return { status: "waiting" };
    data = body && typeof body === "object" && "message" in body ? body.message : body?.data;
  } catch {
    return { status: "waiting" };
  }
  const state = data?.state;
  if (typeof data?.onboarding_token === "string" && data.onboarding_token) {
    await rememberOnboardingToken(data.onboarding_token);
    await forgetPaymentClaim();
    return { status: "ready", email: typeof data?.email === "string" ? data.email : "" };
  }
  // Provisioning with no token: the session went to an earlier poll, or the
  // hub opened none. Keep the claim and keep asking rather than show a PIN
  // step with no session behind it.
  if (state === "Cancelled") return { status: "cancelled" };
  if (state === "Setup Failed") {
    return { status: "failed", error: typeof data?.message === "string" && data.message ? data.message : GENERIC };
  }
  if (state === "unknown") return { status: "none" };
  return { status: "waiting" };
}
