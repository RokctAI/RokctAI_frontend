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
// The hub onboarding session's token on the visitor's browser. control's
// provision_new_tenant answers an onboarding_token (control#204); the
// register provisioner (./agent-register-provision.ts) keeps it here in an
// httpOnly cookie so the email PIN step (agent-onboarding-pin.ts, shown by
// components/custom/auth/agent-verify-pin-step.tsx) and the onboarding chat
// can name the session without the token ever reaching page script.

import { cookies } from "next/headers";

export const ONBOARDING_COOKIE = "rokct_onboarding";
/** The session lives while the tenant site builds; a week is ample. */
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export async function rememberOnboardingToken(token: string): Promise<void> {
  (await cookies()).set(ONBOARDING_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function readOnboardingToken(): Promise<string | null> {
  return (await cookies()).get(ONBOARDING_COOKIE)?.value || null;
}
