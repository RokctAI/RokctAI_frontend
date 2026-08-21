/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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

export class OpportunityPublicService {
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
