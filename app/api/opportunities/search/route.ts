import { unstable_cache } from "next/cache";
import { platformCall } from "@/app/services/base/platform-gateway";
import type { Opportunity } from "@/app/services/public/opportunities";
import { serverSemanticSearch } from "@/app/services/server/semantic-search";
import { analyzeIntent } from "@/app/lib/intent-engine";

export const dynamic = 'force-dynamic';

// ─── GitHub raw CDN URLs ────────────────────────────────────────────────────
const GITHUB_RAW = "https://raw.githubusercontent.com/RokctAI/opportunities/main/published/api";

const GITHUB_URLS: Record<string, string> = {
  tenders: `${GITHUB_RAW}/tenders.json`,
  grants:  `${GITHUB_RAW}/grants.json`,
  equity:  `${GITHUB_RAW}/equity.json`,
};

// ─── Fetch + cache from GitHub (revalidates every 24 hours) ─────────────────
const fetchFromGitHub = unstable_cache(
  async (type: string): Promise<Opportunity[]> => {
    try {
      const res = await fetch(GITHUB_URLS[type], { next: { revalidate: 86400 } });
      if (!res.ok) return [];
      const raw = await res.json();
      const list: any[] = Array.isArray(raw) ? raw : (raw.data ?? []);
      return list.map((item: any) => ({
        title:        cleanTitle(item.title        ?? ""),
        slug:         item.slug         ?? item.title?.toLowerCase().replace(/\s+/g, "-") ?? "",
        institution:  item.institution  ?? item.organization ?? "",
        organization: item.organization ?? item.institution  ?? "",
        closing_date: item.closing_date ?? "",
        deadline:     item.deadline     ?? "",
        category:     item.category     ?? type,
        type,
      }));
    } catch {
      return [];
    }
  },
  ["github-opportunities"],
  { revalidate: 86400, tags: ["opportunities"] },
);

function cleanTitle(title: string): string {
  return title.replace(/^Tender Opportunity:\s*/i, "Tender: ").replace(/^Grant Opportunity:\s*/i, "Grant: ").replace(/^Equity Opportunity:\s*/i, "Equity: ");
}

// ─── Case-insensitive in-memory search ───────────────────────────────────────
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Handle DD-MM-YYYY or DD/MM/YYYY
  const dmyRegex = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;
  const match = dateStr.match(dmyRegex);
  if (match) {
    const [_, day, month, year] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function filterExpired(items: Opportunity[]): Opportunity[] {
  const now = new Date();
  return items.filter((o) => {
    const dateStr = o.deadline || o.closing_date;
    const date = parseDate(dateStr);
    if (!date) return true;
    return date >= now;
  });
}

function filterByQuery(items: Opportunity[], query: string): Opportunity[] {
  if (!query.trim()) return items.slice(0, 20);
  
  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);
  if (keywords.length === 0) {
    // Fallback to basic search if no significant keywords found
    const q = query.toLowerCase();
    return items.filter(
      (o) =>
        o.title?.toLowerCase().includes(q) ||
        (o.institution ?? "").toLowerCase().includes(q) ||
        (o.organization ?? "").toLowerCase().includes(q) ||
        (o.category ?? "").toLowerCase().includes(q),
    );
  }

  return items.filter((o) => {
    const content = `${o.title} ${o.institution} ${o.organization} ${o.category}`.toLowerCase();
    return keywords.some(kw => content.includes(kw));
  });
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  const types = ["tenders", "grants", "equity"] as const;

  // 1. Try backend first (parallel, 8 s timeout)
  try {
    const backendResults = await Promise.all(
      types.map((type) =>
        platformCall<any>(
          "control:get_public_opportunities",
          JSON.stringify({
            opportunity_type: type,
            filters: JSON.stringify({ title: ["like", `%${query}%`] }),
          }),
          {
            method: "GET",
            timeout: 8000,
            fetchOptions: { next: { revalidate: 60 } },
          },
        ),
      ),
    );

    const allNull = backendResults.every((r) => r === null);
    if (!allNull) {
      return Response.json({
        source: "backend",
        tenders: (backendResults[0]?.data ?? backendResults[0] ?? []) as Opportunity[],
        grants:  (backendResults[1]?.data ?? backendResults[1] ?? []) as Opportunity[],
        equity:  (backendResults[2]?.data ?? backendResults[2] ?? []) as Opportunity[],
      });
    }
  } catch {
    // fall through to GitHub
  }

  // 2. Backend unavailable — fetch from GitHub (cached)
  const [tenders, grants, equity] = await Promise.all(
    types.map((t) => fetchFromGitHub(t)),
  );

  const { type: intentType, opportunityType, cleaned } = analyzeIntent(query);

  // If it's a specific type match (e.g., "funding" -> grants), 
  // prioritize showing those and ignore strict keyword matching if needed.
  if (intentType === "type_match" && opportunityType) {
    const results = {
      tenders: opportunityType === "tenders" ? filterExpired(tenders) : [],
      grants:  opportunityType === "grants" ? filterExpired(grants) : [],
      equity:  opportunityType === "equity" ? filterExpired(equity) : [],
    };

    if (cleaned.trim()) {
      const [rankedTenders, rankedGrants, rankedEquity] = await Promise.all([
        serverSemanticSearch.rankResults(cleaned, results.tenders),
        serverSemanticSearch.rankResults(cleaned, results.grants),
        serverSemanticSearch.rankResults(cleaned, results.equity),
      ]);
      return Response.json({
        source: "github",
        tenders: rankedTenders,
        grants:  rankedGrants,
        equity:  rankedEquity,
      });
    }

    return Response.json({
      source: "github",
      ...results,
    });
  }

  const expiredTenders = filterExpired(tenders);
  const expiredGrants = filterExpired(grants);
  const expiredEquity = filterExpired(equity);

  let filteredTenders = filterByQuery(expiredTenders, query);
  let filteredGrants = filterByQuery(expiredGrants, query);
  let filteredEquity = filterByQuery(expiredEquity, query);

  // SEMANTIC FALLBACK: If keyword search found nothing, use semantic search on the full set
  if (query.trim() && (filteredTenders.length === 0 && filteredGrants.length === 0 && filteredEquity.length === 0)) {
    const [rankedTenders, rankedGrants, rankedEquity] = await Promise.all([
      serverSemanticSearch.rankResults(query, expiredTenders),
      serverSemanticSearch.rankResults(query, expiredGrants),
      serverSemanticSearch.rankResults(query, expiredEquity),
    ]);
    
    // Take top 20 from each to avoid huge response
    return Response.json({
      source: "github",
      tenders: rankedTenders.slice(0, 20),
      grants:  rankedGrants.slice(0, 20),
      equity:  rankedEquity.slice(0, 20),
    });
  }

  // Apply semantic ranking to the keyword-filtered results
  if (query.trim()) {
    const [rankedTenders, rankedGrants, rankedEquity] = await Promise.all([
      serverSemanticSearch.rankResults(query, filteredTenders),
      serverSemanticSearch.rankResults(query, filteredGrants),
      serverSemanticSearch.rankResults(query, filteredEquity),
    ]);

    return Response.json({
      source: "github",
      tenders: rankedTenders,
      grants:  rankedGrants,
      equity:  rankedEquity,
    });
  }

  return Response.json({
    source: "github",
    tenders: filteredTenders,
    grants:  filteredGrants,
    equity:  filteredEquity,
  });
}
