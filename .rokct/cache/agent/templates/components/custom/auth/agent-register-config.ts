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
// rokct.ai's register page, for auth_sdk's register registry
// (components/custom/auth/register-registry.ts, auth_sdk >= 1.7.0), which
// the register route reads on the server and the account form renders.
//
// Ray, 2026-09-09: "register is not fitting for all, what rokct need is not
// what all needs, any home sdk need to inject what it needs, just like dart
// auth sdk has". auth_sdk 1.7.0 owns the register FLOW - first name, last
// name, email, password, the sign-in - and nothing product-specific. What
// rokct.ai's register asked on top of that until auth_sdk 1.6.0, inline in
// auth's own register/page.tsx and auth-form.tsx, is declared here instead:
// the plan (prefilled from the `?plan=` link pricing.tsx emits through
// base's LANDING_CONFIG.planSignupUrl), the industry from the control
// site's Industry Type catalogue, the company name, the country, the voucher
// and the service-plan domain. The words are the ones that page and form
// carried - the copy from register/page.tsx, the field labels and
// placeholders through the shell's `t` under the same auth.* keys
// auth-form.tsx read them by. What the submission becomes on the server is
// app/(auth)/agent-register-provision.ts, the other half of the contract.
//
// Two things the registry cannot say, so they moved to the provisioner:
// the domain field used to appear only once a Service (hosting) plan was
// selected, and the form set a hidden `is_service_plan` flag with it - a
// RegisterField has no visibility rule, so the domain is asked as an
// optional field and the provisioner decides service-or-tenant from the
// plan catalogue with the rule the form used. The voucher field used to sit
// behind a "Use voucher" toggle; it is an optional field now.
//
// Client-safe: data and thunks. The two option loaders call server actions
// (a "use server" module is a reference on the client, never its code).
//
// rokct.ai's flow had no post-account steps, so `steps` is empty and the
// page finishes on the account.

import type {
  RegisterConfig,
  RegisterFieldOption,
} from "@/components/custom/auth/register-registry";
import t from "@/app/lib/i18n";
import { PLATFORM_NAME } from "@/app/config/platform";
import { getSubscriptionPlans } from "@/lib/actions/getSubscriptionPlans";
import { getIndustries } from "@/app/(auth)/agent-register-actions";

/**
 * The plan the form starts on when the URL names none, as the form's
 * `useState(selectedPlan || "Free")` did.
 */
export const DEFAULT_PLAN = "Free";

/** The plan catalogue as select options, labelled as the form labelled them. */
export async function planOptions(): Promise<RegisterFieldOption[]> {
  const plans = await getSubscriptionPlans();
  if (!plans.success || !Array.isArray(plans.data)) return [];
  return plans.data.map((p) => ({
    value: p.plan_name,
    label: t("auth.plan_suffix", { plan: p.plan_name }),
  }));
}

/** The industry catalogue as select options; the form's own defaults when the read answers nothing. */
export async function industryOptions(): Promise<RegisterFieldOption[]> {
  const list = await getIndustries();
  const names =
    list && list.length > 0
      ? list
      : [
          "Manufacturing",
          "Retail",
          "Technology",
          "Healthcare",
          "Finance",
          "Education",
          "Distribution",
          "Services",
          "Other",
        ];
  return names.map((name) => ({ value: name, label: name }));
}

const AGENT_REGISTER_CONFIG: RegisterConfig = {
  enabled: true,
  copy: {
    title: "Create Account",
    subtitle: `Join thousands of companies using ${PLATFORM_NAME}`,
    cta: "Get Started",
    signInPrompt: "Already have an account?",
    signInLabel: "Sign in",
  },
  fields: [
    {
      name: "plan",
      label: t("auth.selected_plan"),
      type: "select",
      placeholder: t("auth.ph_select_plan"),
      defaultValue: DEFAULT_PLAN,
      fromQuery: "plan",
      loadOptions: planOptions,
      span: 2,
    },
    {
      name: "industry",
      label: t("auth.label_industry"),
      type: "select",
      placeholder: t("auth.ph_select_industry"),
      required: true,
      loadOptions: industryOptions,
    },
    {
      name: "company_name",
      label: t("auth.label_company_name"),
      type: "text",
      placeholder: t("auth.ph_company_name"),
      required: true,
    },
    {
      name: "country",
      label: t("auth.label_country"),
      type: "text",
      placeholder: t("auth.ph_country"),
      required: true,
    },
    {
      name: "voucher_code",
      label: t("auth.label_voucher_code"),
      type: "text",
      placeholder: t("auth.ph_voucher_code"),
    },
    {
      name: "domain",
      label: t("auth.label_domain"),
      type: "text",
      placeholder: t("auth.ph_domain"),
    },
  ],
  steps: [],
};

export default AGENT_REGISTER_CONFIG;
