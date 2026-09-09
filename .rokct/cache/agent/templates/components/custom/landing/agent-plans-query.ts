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

// rokct.ai's plans query, for base_sdk's plans-query registry
// (components/custom/landing/plans-query.ts, base_sdk >= 1.9.0): the
// platform's `Subscription Plan` catalog WITHOUT its hosting plans,
// WITHOUT its paas plans and WITHOUT its telephony plans.
//
// Ray, 2026-09-09: the hosting shell is a separate frontend on the control
// site that shows only hosting-related subscriptions, "this means
// rokctai_frontend will also filter out hosting related subscriptions" -
// and, once the delivery-platform storefront was ruled the seller of the
// delivery platform and its paas plans, "means paas plans leave rokct too" -
// and, 2026-09-09 again, the product plan categories leave rokct.ai
// altogether: Telephony plans sell on the telephony shell.
// One control backend serves several storefront shells, and each shell
// filters the shared catalog by `plan_category` from its home SDK rather
// than the backend knowing about shells - so the hosting shell's home SDK
// registers the opposite of this query (Hosting only), the delivery
// platform's home SDK registers paas only, the telephony shell's home SDK
// registers Telephony only, and no plan is ever named or numbered here.
//
// The query is base's generic default (LANDING_CONFIG.plansQuery: the same
// doctype, fields and order) with ONE filter laid over it, so a field base
// adds later reaches the pricing section without an edit here. The filter
// runs on the server: the hosting, paas and telephony rows are never
// fetched, so nothing hands them to a section; `pricing.hiddenCategories`
// in agent-landing-config.ts names "hosting", "paas" and "telephony" as
// well, the client-side belt to this server-side brace. A host whose
// landing-config.ts sets `plansQuery` to null prefetches no plans at all,
// and this module honours that by exporting null too.
//
// Registered with one line at // @rokct-sdk-plans-query-start through this
// SDK's manifest integrations. loadLandingPlansQuery() answers the FIRST
// registered entry that loads.

import {
  LANDING_CONFIG,
  type LandingPlansQuery,
} from "@/components/custom/landing/landing-config";

/**
 * The categories rokct.ai does not sell, as the platform's plan fixtures
 * spell them (the server compares them verbatim): Hosting belongs to the
 * hosting shell, paas to the delivery-platform storefront, Telephony to
 * the telephony shell.
 */
const HOSTING_CATEGORY = "Hosting";
const PAAS_CATEGORY = "paas";
const TELEPHONY_CATEGORY = "Telephony";
const EXCLUDED_CATEGORIES: readonly string[] = [
  HOSTING_CATEGORY,
  PAAS_CATEGORY,
  TELEPHONY_CATEGORY,
];

/** A `frappe.client.get_list` filter row: [fieldname, operator, value]. */
type PlanFilter = [string, string, string | string[]];

const EXCLUDE_CATEGORIES: PlanFilter = [
  "plan_category",
  "not in",
  [...EXCLUDED_CATEGORIES],
];

/**
 * Lays the category exclusion over whatever `filters` the generic payload
 * already carries: appended to a list, added to a map keyed by fieldname,
 * or the sole filter when there are none.
 */
function withoutExcludedCategories(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const existing = payload.filters;
  if (Array.isArray(existing)) {
    return { ...payload, filters: [...existing, EXCLUDE_CATEGORIES] };
  }
  if (existing && typeof existing === "object") {
    return {
      ...payload,
      filters: {
        ...(existing as Record<string, unknown>),
        [EXCLUDE_CATEGORIES[0]]: [EXCLUDE_CATEGORIES[1], EXCLUDE_CATEGORIES[2]],
      },
    };
  }
  return { ...payload, filters: [EXCLUDE_CATEGORIES] };
}

const generic = LANDING_CONFIG.plansQuery;

const AGENT_PLANS_QUERY: LandingPlansQuery | null = generic
  ? { cmd: generic.cmd, payload: withoutExcludedCategories(generic.payload) }
  : null;

export default AGENT_PLANS_QUERY;
