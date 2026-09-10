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
// rokct.ai's register provisioner, for auth_sdk's provisioning registry
// (app/(auth)/register-provision.ts, auth_sdk >= 1.7.0): what a submission
// of the register page becomes on the server. This is the control flow
// auth_sdk's app/(auth)/actions.ts register() ran inline until 1.6.0, in
// the same order and with the same answers, over the fields
// components/custom/auth/agent-register-config.ts declares:
//
//   1. the country and currency, resolved from the form's country at the
//      control site (get_pricing_metadata; "South Africa" when empty);
//   2. the platform administrator, through auth's tenant link - without
//      one the registration stops with "System not initialized" rather than
//      calling the control plane unauthenticated;
//   3. with a company name, provisioning at the control site under that
//      administrator: control:provision_service_subscription for a Service
//      plan (a control-plane user, the domain, one line), else
//      control:provision_new_tenant (a queued tenant site);
//   4. the auto-login rule - a Service plan signs in as a normal PaaS login
//      (the user exists on the control plane); a tenant plan that is an AI
//      plan signs in as an onboarding login (`is_onboarding`); a tenant
//      plan that is not stays signed out until the site is ready and the
//      mail arrives.
//
// The sign-in itself is auth's: this module only answers how, through the
// outcome's `signIn` (auth adds `is_paas` and never signs in anywhere but
// the site the outcome names; this one names none, as the old loginParams
// named none). The local user row that maps a registered email to its
// site is auth's write too - this provisioner touches no database and
// hands the provisioned site back as `siteName` for auth to record.
//
// Service-or-tenant is decided here from the plan catalogue with the rule
// the form used to show its domain field (see agent-register-helpers.ts
// isServicePlan), because a RegisterField has no visibility rule.

import { loadTenantLink } from "@/app/(auth)/tenant-link";
import type {
  RegisterOutcome,
  RegisterProvisioner,
  RegisterSignIn,
  RegisterSubmission,
} from "@/app/(auth)/register-provision";

import {
  DEFAULT_COUNTRY,
  isAiPlan,
  isServicePlan,
  lookupPlan,
  provisionNewTenant,
  provisionServiceSubscription,
  resolveRegisterLocale,
} from "./agent-register-helpers";

const agentRegisterProvisioner: RegisterProvisioner = {
  async provision(submission: RegisterSubmission): Promise<RegisterOutcome> {
    const { email, password, firstName, lastName, values } = submission;
    const companyName = values.company_name ?? "";
    const industry = values.industry ?? "";
    const voucherCode = values.voucher_code || null;
    const plan = values.plan ?? "";
    const countryInput = values.country || DEFAULT_COUNTRY;
    const domain = values.domain || null;

    const { country, currency } = await resolveRegisterLocale(countryInput);

    const baseUrl = process.env.ROKCT_BASE_URL;
    if (!baseUrl) {
      console.error("Registration Error: ROKCT_BASE_URL is not set");
      return { status: "failed", error: "Could not create user." };
    }

    // Retrieve the administrator this registration provisions under.
    // ./tenant-link.ts decides where those come from; its default is the
    // GlobalSettings row (set via Admin Login), and a single-tenant shell
    // reads its own deployment secrets.
    const tenantLink = await loadTenantLink();
    const admin = await tenantLink.adminCredentials();
    if (!admin || !admin.apiKey || !admin.apiSecret) {
      return {
        status: "failed",
        error: "System not initialized. Administrator must login first.",
      };
    }

    const planRow = await lookupPlan(plan);
    const servicePlan = isServicePlan(plan, planRow, values.is_service_plan);

    // Provisioning handles User Creation (Service) or Site Setup (Tenant).
    let siteName: string | null = null;
    if (companyName) {
      try {
        const input = {
          baseUrl,
          admin,
          email,
          password,
          firstName,
          lastName,
          companyName,
          plan,
          currency,
          country,
          industry,
          voucherCode,
          domain,
        };
        const result = servicePlan
          ? await provisionServiceSubscription(input)
          : await provisionNewTenant(input);
        if (!result.ok) return { status: "failed", error: result.error };
        siteName = result.siteName;
      } catch (e) {
        console.error("Provisioning Error:", e);
        return { status: "failed", error: "Provisioning exception occurred." };
      }
    }

    // Auto-Login.
    // Service Plans -> Normal PaaS Login (User exists on Control Plane)
    // Tenant Plans which are AI -> Onboarding Login (User exists in DB only, bypass auth)
    // Tenant Plans (Non-AI) -> No Login (Wait for email)
    let signIn: RegisterSignIn | false;
    if (servicePlan) {
      signIn = { email, password };
    } else if (isAiPlan(planRow)) {
      signIn = { email, password, extra: { is_onboarding: "true" } };
    } else {
      signIn = false;
    }

    return { status: "success", siteName, signIn };
  },
};

export default agentRegisterProvisioner;
