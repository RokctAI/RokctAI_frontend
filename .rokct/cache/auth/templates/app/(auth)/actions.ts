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
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user, globalSettings } from "@/db/schema";
// Added at seed time: the source file called getSubscriptionPlans without
// importing it (masked upstream by `typescript.ignoreBuildErrors`).
import { getSubscriptionPlans } from "@/lib/actions/getSubscriptionPlans";
import {
  PlatformGatewayError,
  platformCall,
} from "@/app/services/base/platform-gateway";
import { signIn, auth } from "./auth";

// Provisioning creates a control-plane user or queues a tenant site, so it
// runs well past the gateway client's 10s default; the raw fetch it replaces
// had no timeout at all.
const PROVISIONING_TIMEOUT_MS = 60000;

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
    await signIn("credentials", {
      ...Object.fromEntries(formData),
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

export async function register(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const companyName = formData.get("company_name") as string;
  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  const industry = formData.get("industry") as string;
  const voucherCode = formData.get("voucher_code") as string | null;
  const isServicePlan = formData.get("is_service_plan") === "on";

  const plan = formData.get("plan") as string;
  const countryInput = (formData.get("country") as string) || "South Africa";

  // Resolve Currency from Country (via Control Site API)
  let currency = "USD"; // Default
  let country = countryInput; // Default to input

  try {
    const baseUrl = process.env.ROKCT_BASE_URL;
    if (baseUrl) {
      // Resolve from Country Name (Dynamic based on form input). Still a
      // per-method URL: the control site registers no `control:` gateway cmd
      // for get_pricing_metadata (only the subscription-plans catalogue), so
      // this guest read cannot ride the platform gateway yet.
      const pricingRes = await fetch(
        `${baseUrl}/api/method/control.control.api.subscription.get_pricing_metadata?country=${encodeURIComponent(countryInput)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (pricingRes.ok) {
        const pricingData = await pricingRes.json();
        const data = pricingData.message;
        if (data) {
          if (data.currency) currency = data.currency;
          if (data.country_name) country = data.country_name; // Normalize Country Name
        }
      }
    }
  } catch (err) {
    console.warn("Failed to resolve currency from country:", err);
  }

  try {
    const baseUrl = process.env.ROKCT_BASE_URL;
    if (!baseUrl) throw new Error("ROKCT_BASE_URL is not set");

    // Retrieve Admin Keys from GlobalSettings (set via Admin Login)
    const settings = await db.select().from(globalSettings).limit(1);
    const adminKey = settings.length > 0 ? settings[0].adminApiKey : null;
    const adminSecret = settings.length > 0 ? settings[0].adminApiSecret : null;

    if (!adminKey || !adminSecret) {
      return {
        status: "failed",
        error: "System not initialized. Administrator must login first.",
      };
    }

    // 2. Provisioning handles User Creation (Service) or Site Setup (Tenant)
    let siteName = null;

    if (companyName) {
      try {
        if (isServicePlan) {
          // Method 1: Service Provisioning (Creates Control Plane User).
          // Universal gateway call — the control gateway serves the
          // `control:`-prefixed cmd the control app registers for this
          // provisioning method; the admin credentials go out as an explicit
          // Authorization header (no session exists during registration).
          let provisionData: any;
          try {
            provisionData = await platformCall<any>(
              "control:provision_service_subscription",
              {
                plan: plan,
                email: email,
                password: password,
                first_name: firstName,
                last_name: lastName,
                company_name: companyName,
                currency: currency,
                country: country,
                industry: industry,
                voucher_code: voucherCode,
                domain: formData.get("domain")
                  ? (formData.get("domain") as string)
                  : null,
                lines: 1,
              },
              {
                baseUrl,
                headers: { Authorization: `token ${adminKey}:${adminSecret}` },
                throwOnError: true,
                timeout: PROVISIONING_TIMEOUT_MS,
              },
            );
          } catch (e) {
            // Handle Error: a non-2xx answer is the provisioning failure the
            // raw fetch reported; anything else reaches the outer catch.
            if (e instanceof PlatformGatewayError && e.reason === "http_error") {
              return {
                status: "failed",
                error: "Service Provisioning failed",
              };
            }
            throw e;
          }
          siteName = provisionData?.site_name || provisionData;
        } else {
          // Method 2: Tenant Provisioning (Queues Site, User NOT created on
          // Control Plane). Same gateway route as Method 1.
          let provisionData: any;
          try {
            provisionData = await platformCall<any>(
              "control:provision_new_tenant",
              {
                email: email,
                company_name: companyName,
                plan: plan,
                first_name: firstName,
                last_name: lastName,
                currency: currency,
                country: country,
                industry: industry,
                voucher_code: voucherCode,
              },
              {
                baseUrl,
                headers: { Authorization: `token ${adminKey}:${adminSecret}` },
                throwOnError: true,
                timeout: PROVISIONING_TIMEOUT_MS,
              },
            );
          } catch (e) {
            // Handle Error
            if (e instanceof PlatformGatewayError && e.reason === "http_error") {
              return {
                status: "failed",
                error: "Tenant Provisioning failed",
              };
            }
            throw e;
          }
          siteName = provisionData?.site_name || provisionData;
        }
      } catch (e) {
        console.error("Provisioning Error:", e);
        return { status: "failed", error: "Provisioning exception occurred." };
      }
    }

    // 3. Save User to Local DB (Persistence)
    const initialOnboardingData = {
      user_fullname: `${firstName} ${lastName}`,
      company_name: companyName,
      location: country,
      industry: industry,
      full_name: `${firstName} ${lastName}`,
      trading_name: companyName,
      primary_base: country,
    };

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingUser.length === 0) {
      await db.insert(user).values({
        id: email,
        email: email,
        siteName: siteName,
        onboardingData: initialOnboardingData,
      });
    } else {
      await db
        .update(user)
        .set({
          siteName: siteName,
          onboardingData: initialOnboardingData,
        })
        .where(eq(user.email, email));
    }

    // 4. Auto-Login
    try {
      // Fetch Plan Details to check for AI capability
      let isAiPlan = false;
      const plansRes = await getSubscriptionPlans();
      if (plansRes.success && plansRes.data) {
        const p = plansRes.data.find((x: any) => x.plan_name === plan);
        if (p && p.is_ai === 1) isAiPlan = true;
      }

      // Determine Login Mode
      // Service Plans -> Normal PaaS Login (User exists on Control Plane)
      // Tenant Plans which are AI -> Onboarding Login (User exists in DB only, bypass auth)
      // Tenant Plans (Non-AI) -> No Login (Wait for email)

      const loginParams: any = {
        email: email,
        password: password,
        redirect: false,
        is_paas: "true",
      };

      let shouldLogin = true;

      if (!isServicePlan) {
        if (isAiPlan) {
          loginParams.is_onboarding = "true";
        } else {
          // Non-AI Tenant Plan: User cannot login yet (Site not ready, no onboarding)
          shouldLogin = false;
        }
      }

      if (shouldLogin) {
        await signIn("credentials", loginParams);
      } else {
        // Return success but user is not logged in.
        // They will be redirected to login page usually, or we can show a specific message?
        // The form expects { status: "success" }.
        // The UI might redirect to /login or show "Check your email".
      }
    } catch (loginError) {
      console.warn("Auto-login failed:", loginError);
      // Fallback: If login fails, we still return success for registration.
    }

    return { status: "success" };
  } catch (error) {
    console.error("Registration Error:", error);
    return { status: "failed", error: "Could not create user." };
  }
}

export async function getIndustries(): Promise<string[]> {
  try {
    const baseUrl = process.env.ROKCT_BASE_URL;
    if (!baseUrl) return [];

    // Retrieve Admin Keys
    const settings = await db.select().from(globalSettings).limit(1);
    const adminKey = settings.length > 0 ? settings[0].adminApiKey : null;
    const adminSecret = settings.length > 0 ? settings[0].adminApiSecret : null;

    if (!adminKey || !adminSecret) return [];

    // Framework methods ride the gateway with the full dotted frappe path
    // (same cmd the ControlBaseService.getList helper uses).
    const industries = await platformCall<any[]>(
      "frappe.client.get_list",
      {
        doctype: "Industry Type",
        fields: ["name"],
        limit_page_length: 100,
        order_by: "name asc",
      },
      {
        baseUrl,
        headers: { Authorization: `token ${adminKey}:${adminSecret}` },
      },
    );

    if (Array.isArray(industries)) {
      return industries.map((item: any) => item.name);
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch industries:", error);
    return [];
  }
}
