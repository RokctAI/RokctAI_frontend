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
// repo (published/api/<type>.json and the markdown cards), read from
// raw.githubusercontent.com with no auth and cached by Next's revalidate, the
// way a blog renders posts from repo files. No client call is made here.
// Slugs, as the repo lays them out:
//   tenders: 03_tenders/<slug>/<slug>.md (the folder name)
//   equity:  01_equity/<slug>.md (the file stem)
//   grants:  02_grants/<slug>.md (the file stem); grants.json lists only a
//            few, so the card is tried first and the json entry second.
// This module is pure apart from fetchText/fetchJson, so node tests it.

export const OPPORTUNITIES_RAW =
  "https://raw.githubusercontent.com/RokctAI/opportunities/main";
export const OPPORTUNITIES_REVALIDATE = 3600;

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

export function cardPath(kind: OpportunityKind, slug: string): string {
  const s = encodeURIComponent(slug);
  if (kind === "tenders") return `03_tenders/${s}/${s}.md`;
  if (kind === "equity") return `01_equity/${s}.md`;
  return `02_grants/${s}.md`;
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

// Parse a card: "# Title", then "## Section" blocks of "- **Label**: value"
// lines and free text. Nested "### Heading" lines become text headings.
export function parseCard(kind: OpportunityKind, slug: string, md: string): OpportunityCard | null {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  let title = "";
  const sections: CardSection[] = [];
  let current: CardSection | null = null;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^---\s*$/.test(line)) break;
    if (!title && /^#\s+/.test(line)) {
      title = cleanTitle(line);
      continue;
    }
    const h2 = /^##\s+(.+)$/.exec(line);
    if (h2) {
      current = { heading: h2[1].trim(), fields: [], text: [] };
      sections.push(current);
      continue;
    }
    if (!current || !line.trim()) continue;
    const field = /^\s*[-*]\s+\*\*(.+?)\*\*:?\s*(.*)$/.exec(line);
    if (field) {
      current.fields.push({ label: field[1].replace(/:$/, "").trim(), value: cleanValue(field[2]) });
      continue;
    }
    const link = /^\s*[-*]\s+\[(.+?)\]\((https?:[^)]+)\)/.exec(line);
    if (link) {
      current.fields.push({ label: link[1].trim(), value: link[2].trim() });
      continue;
    }
    const text = line.replace(/^#{3,}\s*/, "").replace(/^\s*[-*]\s+/, "").trim();
    if (text) current.text.push(text);
  }
  if (!title) return null;
  const deadline = parseDate(fieldOf(sections, "Deadline", "Closing Date"));
  const applyUrl = firstUrl(
    fieldOf(sections, "Applying Link", "Direct Link", "Website", "Source / Verification", "Source"),
  );
  const organization = fieldOf(sections, "Organization", "Institution");
  return { kind, slug, title, sections, deadline, applyUrl, organization };
}

// A published/api/<kind>.json row turned into a card, for a grant whose
// markdown card is not in the repo under that slug.
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

async function fetchText(path: string): Promise<string | null> {
  try {
    const res = await fetch(`${OPPORTUNITIES_RAW}/${path}`, {
      next: { revalidate: OPPORTUNITIES_REVALIDATE },
    } as RequestInit);
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

export async function loadRows(kind: OpportunityKind): Promise<Record<string, any>[]> {
  const text = await fetchText(`published/api/${kind}.json`);
  if (!text) return [];
  try {
    const rows = JSON.parse(text);
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

export async function loadSummaries(kind: OpportunityKind): Promise<OpportunitySummary[]> {
  return (await loadRows(kind)).filter((r) => r && r.slug).map((r) => summaryFromRow(kind, r));
}

// The card for a slug, or null when the repo has no such opportunity.
export async function loadCard(kind: OpportunityKind, slug: string): Promise<OpportunityCard | null> {
  if (!isValidSlug(slug)) return null;
  const md = await fetchText(cardPath(kind, slug));
  const card = md ? parseCard(kind, slug, md) : null;
  if (card) return card;
  const row = (await loadRows(kind)).find((r) => r && r.slug === slug);
  return row ? cardFromRow(kind, row) : null;
}
