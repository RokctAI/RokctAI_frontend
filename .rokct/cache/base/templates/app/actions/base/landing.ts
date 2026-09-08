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

// Server data for the generic landing page (app/landing/page.tsx).

import { platformCall } from "@/app/services/base/platform-gateway";
import { loadLandingPlansQuery } from "@/components/custom/landing/plans-query";

/** A plan row as a registered pricing section reads it; extra fields pass through. */
export interface LandingPlan {
  name?: string;
  plan_name: string;
  cost: number;
  currency?: string;
  billing_interval?: string;
  billing_interval_count?: number;
  trial_period_days?: number;
  plan_category?: string;
  category?: string;
  is_per_seat_plan?: number | boolean;
  is_free_plan?: number | boolean;
  base_user_count?: number;
  features?: string[];
  [extra: string]: unknown;
}

/**
 * The plans the page hands every registered section, fetched through the
 * platform gateway as a guest (no credentials) with the query
 * `loadLandingPlansQuery()` resolves: the home SDK's own query when one is
 * registered in components/custom/landing/plans-query.ts, else the generic
 * `LANDING_CONFIG.plansQuery`. Empty when no query is configured, when the
 * gateway has no base URL, or when the call fails - a pricing section then
 * hides itself rather than the page failing.
 */
export async function getLandingPlans(): Promise<LandingPlan[]> {
  const query = await loadLandingPlansQuery();
  if (!query) return [];
  try {
    const response = await platformCall<unknown>(query.cmd, query.payload, {
      requireAuth: false,
    });
    const rows = Array.isArray(response)
      ? response
      : (response as { message?: unknown } | null)?.message;
    if (!Array.isArray(rows)) return [];
    return rows.map((row) => {
      const plan = row as LandingPlan;
      // A pricing section groups by `category`; the doctype names it
      // `plan_category`. Carry both so either shape of row works.
      return { ...plan, category: plan.category ?? plan.plan_category };
    });
  } catch (e) {
    console.error("[landing] plans fetch failed:", e);
    return [];
  }
}
