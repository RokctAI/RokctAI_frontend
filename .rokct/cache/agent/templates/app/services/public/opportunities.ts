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

// Provided by agent_sdk's Next.js half (templates/app/services/public/
// opportunities.ts), installed to app/services/public/opportunities.ts in the
// host. The landing hero (components/custom/hero.tsx) imports
// OpportunityPublicService and Opportunity from here for its opportunity
// search, and the /opportunities pages (agent_sdk 1.21.1) read their rows
// through rows() and bySlug(), so both go backend first and GitHub's
// published/api only as the fallback. platformCall comes from base_sdk's platform gateway, which is
// listed under this manifest's requires.

import { platformCall } from "@/app/services/base/platform-gateway";

export interface Opportunity {
  title: string;
  slug: string;
  institution?: string;
  organization?: string;
  closing_date?: string;
  deadline?: string;
  category?: string;
  type?: string;
  tasks?: any[];
}

function cleanTitle(title: string): string {
  return title
    .replace(/^Tender Opportunity:\s*/i, "Tender: ")
    .replace(/^Grant Opportunity:\s*/i, "Grant: ")
    .replace(/^Equity Opportunity:\s*/i, "Equity: ");
}

// GitHub's published/api, read only when the backend returns nothing.
const PUBLISHED_API =
  "https://raw.githubusercontent.com/RokctAI/opportunities/main/published/api";

function asRows(result: any): Record<string, any>[] {
  const rows = result?.data ?? result;
  return Array.isArray(rows) ? rows : [];
}

async function publishedRows(type: string): Promise<Record<string, any>[]> {
  try {
    const res = await fetch(`${PUBLISHED_API}/${type}.json`, {
      next: { revalidate: 3600 },
    } as RequestInit);
    return res.ok ? asRows(await res.json()) : [];
  } catch {
    return [];
  }
}

async function backendRows(type: string, filters?: Record<string, unknown>) {
  try {
    return asRows(
      await platformCall<any>(
        "control:get_public_opportunities",
        JSON.stringify({
          opportunity_type: type,
          ...(filters ? { filters: JSON.stringify(filters) } : {}),
        }),
        { method: "GET", fetchOptions: { next: { revalidate: 60 } } },
      ),
    );
  } catch {
    return [];
  }
}

export class OpportunityPublicService {
  // Every published row of a type: the backend, else GitHub's published/api.
  static async rows(type: string): Promise<Record<string, any>[]> {
    const rows = await backendRows(type);
    return rows.length > 0 ? rows : publishedRows(type);
  }

  // The published row for a slug, or null: the backend's slug filter first,
  // else the same row from GitHub's published/api.
  static async bySlug(type: string, slug: string): Promise<Record<string, any> | null> {
    const hit = (rows: Record<string, any>[]) => rows.find((r) => r && r.slug === slug) ?? null;
    return hit(await backendRows(type, { slug })) ?? hit(await publishedRows(type));
  }

  static async search(query: string) {
    const types = ["tenders", "grants", "equity"];

    // ── 1. Original backend fetch (unchanged) ──────────────────────────────
    const results = await Promise.all(
      types.map((type) =>
        platformCall<any>(
          "control:get_public_opportunities",
          JSON.stringify({
            opportunity_type: type,
            filters: JSON.stringify({ title: ["like", `%${query}%`] }),
          }),
          { method: "GET", fetchOptions: { next: { revalidate: 60 } } },
        ),
      ),
    );

    const tenders = (results[0]?.data ?? results[0] ?? []) as Opportunity[];
    const grants = (results[1]?.data ?? results[1] ?? []) as Opportunity[];
    const equity = (results[2]?.data ?? results[2] ?? []) as Opportunity[];

    const clean = (opps: Opportunity[]) =>
      opps.map((o) => ({ ...o, title: cleanTitle(o.title) }));

    // ── 2. If backend returned data, use it ────────────────────────────────
    const hasData =
      tenders.length > 0 || grants.length > 0 || equity.length > 0;
    if (hasData) {
      return {
        tenders: clean(tenders),
        grants: clean(grants),
        equity: clean(equity),
      };
    }

    // ── 3. Backend unavailable / empty — fall back to GitHub-cached data ───
    try {
      const base =
        typeof window !== "undefined"
          ? ""
          : process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : `http://localhost:${process.env.PORT ?? 3000}`;

      const res = await fetch(
        `${base}/api/opportunities/search?q=${encodeURIComponent(query)}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error("fallback failed");
      const data = await res.json();
      return {
        tenders: clean((data.tenders ?? []) as Opportunity[]),
        grants: clean((data.grants ?? []) as Opportunity[]),
        equity: clean((data.equity ?? []) as Opportunity[]),
      };
    } catch {
      return { tenders: [], grants: [], equity: [] };
    }
  }
}
