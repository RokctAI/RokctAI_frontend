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

import { AuthError } from "next-auth";

import { headers } from "next/headers";

import {
  PlatformGatewayError,
  platformCall,
} from "@/app/services/base/platform-gateway";
import { TENANT_SITE_HEADER } from "@/app/services/base/tenant-host-control";
import { signIn, auth } from "./auth";
import { linkRegisteredAccount } from "./register-link";
import { loadRegisterProvisioner } from "./register-provision";
import { resolveRegisterBaseUrl } from "./register-provision-default";
import { loadTenantLink } from "./tenant-link";

export async function getCurrentSession() {
  return await auth();
}

export async function refreshTokens() {
  const session = await auth();
  if (!session || !session.user)
    return { success: false, error: "No active session" };

  try {
    const user = session.user as any;
    const refresh_token = user.refreshToken;
    const baseUrl = process.env.ROKCT_BASE_URL;

    if (!refresh_token || !baseUrl) {
      return { success: false, error: "Refresh token or Base URL missing" };
    }

    // Universal gateway call — cmd is the prefix-free auth manifest key
    // (`{app_name}.api.auth.refresh`), never a per-method URL.
    const data = await platformCall<any>(
      "api.auth.refresh",
      { refresh_token },
      { baseUrl },
    );

    if (!data) {
      throw new Error("Backend refresh failed");
    }

    if (data.status === true) {
      return {
        success: true,
        data: data.data, // { access_token, refresh_token, expires_at }
      };
    }

    return { success: false, error: data.message || "Token rotation failed" };
  } catch (error) {
    console.error("Token refresh failed:", error);
    return { success: false, error: "Failed to rotate tokens" };
  }
}

export type ActionState = {
  error?: string;
  status?:
    | "idle"
    | "success"
    | "failed"
    | "invalid_data"
    | "user_exists"
    | "verify_email";
  /** With `verify_email`: the site the account was created on, for the code step. */
  siteName?: string | null;
};

export async function login(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    // auth_sdk 1.7.0: a login on a resolved tenant host signs in against
    // that host's site when the form named none - the `x-rokct-tenant-site`
    // header middleware.ts forwarded. A `site_name` on the form still wins.
    const fields = Object.fromEntries(formData);
    const formSite =
      typeof fields.site_name === "string" ? fields.site_name.trim() : "";
    const headerSite = formSite
      ? null
      : (await headers()).get(TENANT_SITE_HEADER)?.trim() || null;
    await signIn("credentials", {
      ...fields,
      ...(headerSite ? { site_name: headerSite } : {}),
      is_paas: formData.get("is_paas"), // Pass the flag explicitly
      redirect: false,
    });
    return { status: "success" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { status: "failed", error: "Invalid credentials." };
        default:
          return { status: "failed", error: "Something went wrong." };
      }
    }
    throw error;
  }
}

/**
 * Register (auth_sdk 1.7.0): collect, hand to the provisioner, sign in.
 *
 * The account fields are this SDK's (first name, last name, email,
 * password); every other field on the form was declared by the home SDK's
 * register config (components/custom/auth/register-registry.ts) and goes
 * to its provisioner (./register-provision.ts) under `values`, untouched.
 * What the provisioner does with them is its own business; this action
 * links the account locally, then signs it in the way the outcome asks,
 * and never signs in against anything but the site the outcome names.
 *
 * The local link is auth's own step, not the provisioner's: the user row
 * that maps the account to the site it came from (./register-link.ts,
 * through ./tenant-link.ts - the multi-tenancy store, or a per-shell
 * no-op) is written after ANY provisioner succeeds, exactly where 1.6.0
 * wrote it, and no provisioner has to know it exists.
 */
export async function register(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value.trim() : "";
  };
  const email = text("email");
  const password = (formData.get("password") as string | null) ?? "";
  const firstName = text("first_name");
  const lastName = text("last_name");
  if (!email || !password || !firstName || !lastName) {
    return { status: "invalid_data", error: "Every account field is required." };
  }

  const values: Record<string, string> = {};
  for (const [name, value] of formData.entries()) {
    if (ACCOUNT_FIELDS.has(name) || typeof value !== "string") continue;
    values[name] = value;
  }

  const tenantSite =
    text("site_name") ||
    (await headers()).get(TENANT_SITE_HEADER)?.trim() ||
    null;

  try {
    const provisioner = await loadRegisterProvisioner();
    const outcome = await provisioner.provision({
      email,
      password,
      firstName,
      lastName,
      values,
      tenantSite,
    });
    if (outcome.status !== "success") {
      return { status: outcome.status, error: outcome.error };
    }

    // Link the new account to its site locally (Persistence), as 1.6.0
    // did after provisioning and before the auto-login. A link with
    // nowhere to write makes this a no-op; see ./tenant-link.ts.
    await linkRegisteredAccount(
      { email, firstName, lastName, values, tenantSite },
      outcome,
      loadTenantLink,
    );

    if (outcome.signIn) {
      try {
        await signIn("credentials", {
          email: outcome.signIn.email,
          password: outcome.signIn.password,
          ...(outcome.signIn.siteName
            ? { site_name: outcome.signIn.siteName }
            : {}),
          ...(outcome.signIn.extra ?? {}),
          is_paas: "true",
          redirect: false,
        });
      } catch (loginError) {
        // The account exists but the site will not sign it in until the
        // emailed code is entered: hand the page its code step.
        if (outcome.verifyEmail) {
          return {
            status: "verify_email",
            siteName: outcome.signIn.siteName ?? tenantSite,
            error: outcome.message,
          };
        }
        // Otherwise a sign-in that fails leaves the visitor at the login,
        // as before.
        console.warn("Auto-login failed:", loginError);
      }
    }
    return { status: "success", error: outcome.message };
  } catch (error) {
    console.error("Registration Error:", error);
    return { status: "failed", error: "Could not create user." };
  }
}

/** The platform's guest email-code check (users_sdk's `api.user.verify_email_code`). */
const VERIFY_EMAIL_CODE_CMD = "api.user.verify_email_code";
/** The platform's guest code re-send (users_sdk's `api.user.resend_verification_email`). */
const RESEND_CODE_CMD = "api.user.resend_verification_email";

/**
 * The register page's code step: check the 6-digit code register_user
 * emailed, then sign the account in with the credentials the visitor just
 * registered with (api.user.login stops answering 403 once it is spent).
 */
export async function verifyRegistrationEmail(input: {
  email: string;
  password: string;
  code: string;
  siteName: string | null;
}): Promise<ActionState> {
  const email = input.email.trim();
  const code = input.code.trim();
  if (!email || !code) {
    return { status: "invalid_data", error: "Enter the code we emailed you." };
  }
  const target = await resolveRegisterBaseUrl(input.siteName);
  if (!target.baseUrl) return { status: "failed", error: "error" in target ? target.error : "No site to register on." };

  try {
    const result = await platformCall<{ status_code?: number; message?: string }>(
      VERIFY_EMAIL_CODE_CMD,
      { email, otp: code },
      { baseUrl: target.baseUrl, session: null, requireAuth: false, throwOnError: true },
    );
    // verify_email_code answers through api_response: a wrong or expired code
    // is HTTP 200 with status_code 401 (400/403/404/500 for the other
    // failures) in the body, never a `status: false` flag.
    if (!result || Number(result.status_code ?? 200) >= 400) {
      return { status: "failed", error: result?.message || "Invalid or expired verification code." };
    }
  } catch (e) {
    if (e instanceof PlatformGatewayError && e.reason === "http_error") {
      return { status: "failed", error: "Invalid or expired verification code." };
    }
    console.error("[auth] verify_email_code failed:", e);
    return { status: "failed", error: "Could not reach the site." };
  }

  try {
    await signIn("credentials", {
      email,
      password: input.password,
      ...(input.siteName ? { site_name: input.siteName } : {}),
      is_paas: "true",
      redirect: false,
    });
  } catch (loginError) {
    // Verified, but not signed in: the visitor can still use the login.
    console.warn("Sign-in after verification failed:", loginError);
    return { status: "failed", error: "Your email is verified. Please sign in." };
  }
  return { status: "success" };
}

/** Re-send the registration code; the site answers the same whether or not one went out. */
export async function resendRegistrationCode(input: {
  email: string;
  siteName: string | null;
}): Promise<ActionState> {
  const target = await resolveRegisterBaseUrl(input.siteName);
  if (!target.baseUrl) return { status: "failed", error: "error" in target ? target.error : "No site to register on." };
  try {
    await platformCall(
      RESEND_CODE_CMD,
      { email: input.email.trim() },
      { baseUrl: target.baseUrl, session: null, requireAuth: false, throwOnError: true },
    );
    return { status: "success" };
  } catch (e) {
    console.error("[auth] resend_verification_email failed:", e);
    return { status: "failed", error: "Could not send a new code. Try again shortly." };
  }
}

/** The fields the register form owns; everything else is the home SDK's. */
const ACCOUNT_FIELDS = new Set([
  "email",
  "password",
  "first_name",
  "last_name",
  "site_name",
]);
