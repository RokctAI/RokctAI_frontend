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

// The generic values of the landing host (app/landing/page.tsx and
// components/custom/landing-content.tsx): the auth URLs, the shape of the
// floating section nav, and the platform query the page prefetches plans
// with. No product copy lives here: every section of the page - its words,
// images, links and prices - belongs to the home SDK that registers it in
// ./page-sections.ts (agent_sdk for rokctapp), the way a Dart home SDK
// holds its own profile screens. The hero's copy stays in ./hero-config.ts,
// and the plans query a home SDK substitutes for the default below stays in
// ./plans-query.ts.

/**
 * How a nav entry may be flagged: "new" for something just shipped, "soon"
 * for something announced but not live yet. The words are the vocabulary,
 * not the wording - each shell renders and translates them its own way.
 */
export type LandingNavBadge = "new" | "soon";

/** One entry of the floating section nav: the DOM id it scrolls to and its tooltip. */
export interface LandingNavItem {
  id: string;
  label: string;
  /**
   * An optional flag beside the label. Absent - the overwhelming case - is
   * a plain entry, so every `{ id, label }` a section already registers
   * stays valid untouched. The badge travels with the entry the section
   * owns, because the floating nav's list IS what the home SDK registered:
   * there is no second registry to keep in step, and a section that stops
   * being new only edits its own `meta.nav`.
   */
  badge?: LandingNavBadge;
}

/**
 * How app/actions/base/landing.ts fetches the plans the page hands every
 * registered section: a gateway command and its payload, sent without
 * credentials.
 *
 * The value below is the GENERIC default. A home SDK whose product sells a
 * catalog of its own registers its query in ./plans-query.ts instead of
 * editing this installed file, which the next compose regenerates.
 */
export interface LandingPlansQuery {
  cmd: string;
  payload: Record<string, unknown>;
}

export interface LandingConfig {
  loginUrl: string;
  signupUrl: string;
  /** Where a plan's button goes; no plan is the generic sign-up. */
  planSignupUrl: (plan?: string) => string;
  /** The floating nav's fixed ends: the hero first and the footer last. Registered sections add their own entries between them through `meta.nav`. */
  nav: {
    hero: LandingNavItem;
    footer: LandingNavItem;
  };
  /**
   * The default plans query: the platform's own `Subscription Plan`
   * catalog - the plans on which someone RUNS a rokct app. It is what
   * rokctai_frontend's pricing sells, and it is NOT what a product whose
   * visitors are its end users sells; such a product registers its own
   * query in ./plans-query.ts, which wins over this value. `null`
   * prefetches no plans; the page then hands every section an empty list.
   */
  plansQuery: LandingPlansQuery | null;
}

export const LANDING_CONFIG: LandingConfig = {
  loginUrl: "/login",
  signupUrl: "/register",
  planSignupUrl: (plan) =>
    plan ? `/register?plan=${encodeURIComponent(plan)}` : "/register",

  nav: {
    hero: { id: "hero", label: "Hero" },
    footer: { id: "footer", label: "Footer" },
  },

  plansQuery: {
    cmd: "frappe.client.get_list",
    payload: {
      doctype: "Subscription Plan",
      fields: [
        "name",
        "plan_name",
        "cost",
        "currency",
        "billing_interval",
        "billing_interval_count",
        "trial_period_days",
        "plan_category",
        "is_per_seat_plan",
        "base_user_count",
      ],
      order_by: "cost asc",
    },
  },
};
