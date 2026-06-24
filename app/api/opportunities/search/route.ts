import { unstable_cache } from "next/cache";
import { callPublicApi } from "@/app/services/common/api";
import type { Opportunity } from "@/app/services/public/opportunities";

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
  const q = query.toLowerCase();
  return items.filter(
    (o) =>
      o.title?.toLowerCase().includes(q) ||
      (o.institution ?? "").toLowerCase().includes(q) ||
      (o.organization ?? "").toLowerCase().includes(q) ||
      (o.category ?? "").toLowerCase().includes(q),
  );
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
        callPublicApi(
          "rokct.platform.api.control",
          {
            cmd: "control:get_public_opportunities",
            payload: JSON.stringify({
              opportunity_type: type,
              filters: JSON.stringify({ title: ["like", `%${query}%`] }),
            }),
          },
          { timeout: 8000 },
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

  return Response.json({
    source: "github",
    tenders: filterByQuery(filterExpired(tenders), query),
    grants:  filterByQuery(filterExpired(grants),  query),
    equity:  filterByQuery(filterExpired(equity),  query),
  });
}
