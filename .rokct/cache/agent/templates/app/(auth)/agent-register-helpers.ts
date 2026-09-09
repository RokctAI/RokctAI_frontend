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
// rokct.ai's register helpers (agent_sdk 1.12.0): the server-side pieces
// auth_sdk's app/(auth)/actions.ts register() carried inline until 1.6.0,
// moved out of auth_sdk with auth 1.7.0 and into this SDK, each as it was:
// the country and currency lookup at the control site's
// get_pricing_metadata, the two provisioning calls
// (control:provision_service_subscription for a Service plan,
// control:provision_new_tenant for a tenant plan) under the platform
// administrator's keys, and the plan-catalogue read the auto-login rule
// needs. ./agent-register-provision.ts strings them together. Server code:
// nothing here is reachable from the client-safe register config.
//
// Credentials arrive as values from auth's tenant link
// (loadTenantLink().adminCredentials() - the GlobalSettings row on a
// multi-tenant shell, ROKCT_ADMIN_API_KEY / ROKCT_ADMIN_API_SECRET on a
// single-tenant one) and go out as an explicit Authorization header; no
// key is written down here.

import {
  PlatformGatewayError,
  platformCall,
} from "@/app/services/base/platform-gateway";
import { getSubscriptionPlans } from "@/lib/actions/getSubscriptionPlans";
import type { TenantLinkAdmin } from "@/app/(auth)/tenant-link";

// Provisioning creates a control-plane user or queues a tenant site, so it
// runs well past the gateway client's 10s default; the raw fetch it replaces
// had no timeout at all.
export const PROVISIONING_TIMEOUT_MS = 60000;

/** The country the form falls back to when the field is empty, as register() did. */
export const DEFAULT_COUNTRY = "South Africa";
/** The currency when the control site names none. */
export const DEFAULT_CURRENCY = "USD";

/** The control site's per-method path for the pricing metadata read. */
export const PRICING_METADATA_PATH =
  "/api/method/control.control.api.subscription.get_pricing_metadata";

export interface RegisterLocale {
  country: string;
  currency: string;
}

/**
 * Resolve Currency from Country (via Control Site API). Still a per-method
 * URL: the control site registers no `control:` gateway cmd for
 * get_pricing_metadata (only the subscription-plans catalogue), so this
 * guest read cannot ride the platform gateway yet. A failed read keeps the
 * input country and the default currency, as before.
 */
export async function resolveRegisterLocale(
  countryInput: string,
  baseUrl: string | undefined = process.env.ROKCT_BASE_URL,
): Promise<RegisterLocale> {
  let currency = DEFAULT_CURRENCY;
  let country = countryInput;
  try {
    if (baseUrl) {
      const pricingRes = await fetch(
        `${baseUrl}${PRICING_METADATA_PATH}?country=${encodeURIComponent(countryInput)}`,
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
  return { country, currency };
}

/** One row of the plan catalogue, as far as the register flow reads it. */
export interface RegisterPlan {
  plan_name: string;
  plan_type?: string | null;
  is_ai?: number | null;
}

/** The catalogue row for `plan`, or null when the read fails or names no such plan. */
export async function lookupPlan(plan: string): Promise<RegisterPlan | null> {
  if (!plan) return null;
  const plansRes = await getSubscriptionPlans();
  if (plansRes.success && plansRes.data) {
    const p = plansRes.data.find((x: RegisterPlan) => x.plan_name === plan);
    return p ?? null;
  }
  return null;
}

/**
 * Whether `plan` is a Service plan - the rule auth-form.tsx used to show the
 * domain field and set its `is_service_plan` flag: the catalogue says
 * "Service", or the name involves hosting (the safe fallback). A flag a
 * form still sends is honoured too.
 */
export function isServicePlan(
  plan: string,
  row: RegisterPlan | null,
  flag?: string,
): boolean {
  if (flag === "on" || flag === "true") return true;
  return (
    row?.plan_type === "Service" || plan.toLowerCase().includes("hosting")
  );
}

/** Whether `row` is an AI plan, the auto-login rule's other input. */
export function isAiPlan(row: RegisterPlan | null): boolean {
  return !!row && row.is_ai === 1;
}

export interface ProvisionInput {
  baseUrl: string;
  admin: TenantLinkAdmin;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  plan: string;
  currency: string;
  country: string;
  industry: string;
  voucherCode: string | null;
  domain: string | null;
}

export type ProvisionResult =
  | { ok: true; siteName: string | null }
  | { ok: false; error: string };

/** The site a provisioning answer names: `site_name`, else the answer itself when it is one. */
function siteFrom(provisionData: unknown): string | null {
  const site =
    provisionData && typeof provisionData === "object"
      ? (provisionData as { site_name?: unknown }).site_name
      : provisionData;
  return typeof site === "string" && site ? site : null;
}

function authorization(admin: TenantLinkAdmin): Record<string, string> {
  return { Authorization: `token ${admin.apiKey}:${admin.apiSecret}` };
}

/**
 * Method 1: Service Provisioning (Creates Control Plane User). Universal
 * gateway call - the control gateway serves the `control:`-prefixed cmd
 * the control app registers for this provisioning method; the admin
 * credentials go out as an explicit Authorization header (no session
 * exists during registration).
 */
export async function provisionServiceSubscription(
  input: ProvisionInput,
): Promise<ProvisionResult> {
  try {
    const provisionData = await platformCall<any>(
      "control:provision_service_subscription",
      {
        plan: input.plan,
        email: input.email,
        password: input.password,
        first_name: input.firstName,
        last_name: input.lastName,
        company_name: input.companyName,
        currency: input.currency,
        country: input.country,
        industry: input.industry,
        voucher_code: input.voucherCode,
        domain: input.domain,
        lines: 1,
      },
      {
        baseUrl: input.baseUrl,
        headers: authorization(input.admin),
        throwOnError: true,
        timeout: PROVISIONING_TIMEOUT_MS,
      },
    );
    return { ok: true, siteName: siteFrom(provisionData) };
  } catch (e) {
    // A non-2xx answer is the provisioning failure the raw fetch reported;
    // anything else reaches the caller.
    if (e instanceof PlatformGatewayError && e.reason === "http_error") {
      return { ok: false, error: "Service Provisioning failed" };
    }
    throw e;
  }
}

/**
 * Method 2: Tenant Provisioning (Queues Site, User NOT created on Control
 * Plane). Same gateway route as Method 1.
 */
export async function provisionNewTenant(
  input: ProvisionInput,
): Promise<ProvisionResult> {
  try {
    const provisionData = await platformCall<any>(
      "control:provision_new_tenant",
      {
        email: input.email,
        company_name: input.companyName,
        plan: input.plan,
        first_name: input.firstName,
        last_name: input.lastName,
        currency: input.currency,
        country: input.country,
        industry: input.industry,
        voucher_code: input.voucherCode,
      },
      {
        baseUrl: input.baseUrl,
        headers: authorization(input.admin),
        throwOnError: true,
        timeout: PROVISIONING_TIMEOUT_MS,
      },
    );
    return { ok: true, siteName: siteFrom(provisionData) };
  } catch (e) {
    if (e instanceof PlatformGatewayError && e.reason === "http_error") {
      return { ok: false, error: "Tenant Provisioning failed" };
    }
    throw e;
  }
}
