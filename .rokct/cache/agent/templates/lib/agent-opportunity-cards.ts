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


// agent_sdk 1.21.0: the opportunity detail pages at
// rokct.ai/opportunities/<grants|tenders|equity>/<slug>, the URLs the landing
// search (agent-opportunities.tsx getOpportunityPath) and the factory's Reel
// links point at. Built on the server from the public RokctAI/opportunities
// repo, read from raw.githubusercontent.com with no auth and cached by Next's
// revalidate. No client call is made here.
// agent_sdk 1.21.1: the rows come from OpportunityPublicService
// (app/services/public/opportunities.ts), the same loader the landing search
// uses: the backend (control:get_public_opportunities, which reads
// published/api/<kind>.json) first, GitHub's published/api only as its
// fallback. This module only turns those rows into the page's card and
// summaries; the markdown cards are never fetched or parsed. It is pure, so
// node tests it.

export type OpportunityKind = "grants" | "tenders" | "equity";
export const OPPORTUNITY_KINDS: OpportunityKind[] = ["grants", "tenders", "equity"];

export const KIND_LABEL: Record<OpportunityKind, string> = {
  grants: "Grant",
  tenders: "Tender",
  equity: "Equity",
};

export interface CardSection {
  heading: string;
  fields: { label: string; value: string }[];
  text: string[];
}

export interface OpportunityCard {
  kind: OpportunityKind;
  slug: string;
  title: string;
  sections: CardSection[];
  deadline: string | null;
  applyUrl: string | null;
  organization: string | null;
}

export interface OpportunitySummary {
  kind: OpportunityKind;
  slug: string;
  title: string;
  organization: string | null;
  deadline: string | null;
}

const SLUG_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function isOpportunityKind(value: string): value is OpportunityKind {
  return (OPPORTUNITY_KINDS as string[]).includes(value);
}

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug) && !slug.includes("..");
}

export function opportunityHref(kind: OpportunityKind, slug: string): string {
  return `/opportunities/${kind}/${encodeURIComponent(slug)}`;
}

export function cleanTitle(title: string): string {
  return title
    .replace(/^#\s*/, "")
    .replace(/^(Tender|Grant|Equity) Opportunity:\s*/i, "")
    .trim();
}

// A real ISO date, or null ("See Documents", "N/A", "Rolling").
export function parseDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const m = /(\d{4}-\d{2}-\d{2})/.exec(value);
  if (!m) return null;
  return Number.isNaN(Date.parse(m[1])) ? null : m[1];
}

export function isClosed(deadline: string | null, now: Date = new Date()): boolean {
  if (!deadline) return false;
  const today = now.toISOString().slice(0, 10);
  return deadline < today;
}

function cleanValue(v: string): string {
  const t = v.trim();
  return /^n\/?a$/i.test(t) ? "" : t;
}

function fieldOf(sections: CardSection[], ...labels: string[]): string | null {
  const wanted = labels.map((l) => l.toLowerCase());
  for (const s of sections) {
    for (const f of s.fields) {
      if (wanted.includes(f.label.toLowerCase()) && f.value) return f.value;
    }
  }
  return null;
}

function firstUrl(value: string | null): string | null {
  if (!value) return null;
  const m = /https?:\/\/[^\s)\]]+/.exec(value);
  return m ? m[0] : null;
}

// A published/api/<kind>.json row turned into the page's card.
export function cardFromRow(kind: OpportunityKind, row: Record<string, any>): OpportunityCard {
  const skip = new Set(["title", "slug", "category"]);
  const fields = Object.entries(row)
    .filter(([k, v]) => !skip.has(k) && typeof v === "string" && cleanValue(v))
    .map(([k, v]) => ({
      label: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: cleanValue(v as string),
    }));
  const deadline = parseDate(row.deadline ?? row.closing_date);
  return {
    kind,
    slug: String(row.slug),
    title: cleanTitle(String(row.title ?? row.slug)),
    sections: [{ heading: "Quick Stats", fields, text: [] }],
    deadline,
    applyUrl: firstUrl(row.applying_link ?? row.direct_link ?? row.website ?? row.source ?? null),
    organization: cleanValue(String(row.organization ?? row.institution ?? "")) || null,
  };
}

export function summaryFromRow(kind: OpportunityKind, row: Record<string, any>): OpportunitySummary {
  return {
    kind,
    slug: String(row.slug),
    title: cleanTitle(String(row.title ?? row.slug)),
    organization: cleanValue(String(row.organization ?? row.institution ?? "")) || null,
    deadline: parseDate(row.deadline ?? row.closing_date),
  };
}

// Open rows first (soonest deadline first, undated after), closed dropped.
export function openSummaries(
  rows: OpportunitySummary[],
  now: Date = new Date(),
  exclude?: string,
): OpportunitySummary[] {
  return rows
    .filter((r) => r.slug && r.slug !== exclude && !isClosed(r.deadline, now))
    .sort((a, b) => {
      if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return a.title.localeCompare(b.title);
    });
}

// A published row for a slug, as the page's card; null when there is none.
export function cardForSlug(
  kind: OpportunityKind,
  slug: string,
  row: Record<string, any> | null | undefined,
): OpportunityCard | null {
  if (!isValidSlug(slug) || !row || row.slug !== slug) return null;
  return cardFromRow(kind, row);
}

export function summariesFromRows(kind: OpportunityKind, rows: Record<string, any>[]): OpportunitySummary[] {
  return rows.filter((r) => r && r.slug).map((r) => summaryFromRow(kind, r));
}
