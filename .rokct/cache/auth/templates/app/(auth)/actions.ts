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

import { platformCall } from "@/app/services/base/platform-gateway";
import { TENANT_SITE_HEADER } from "@/app/services/base/tenant-host-control";
import { signIn, auth } from "./auth";
import { linkRegisteredAccount } from "./register-link";
import { loadRegisterProvisioner } from "./register-provision";
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
  status?: "idle" | "success" | "failed" | "invalid_data" | "user_exists";
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
        // The account exists; a sign-in that fails leaves the visitor at
        // the login, as before.
        console.warn("Auto-login failed:", loginError);
      }
    }
    return { status: "success", error: outcome.message };
  } catch (error) {
    console.error("Registration Error:", error);
    return { status: "failed", error: "Could not create user." };
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
