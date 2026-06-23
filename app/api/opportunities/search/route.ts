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
        title:        item.title        ?? "",
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

// ─── Case-insensitive in-memory search ───────────────────────────────────────
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
    tenders: filterByQuery(tenders, query),
    grants:  filterByQuery(grants,  query),
    equity:  filterByQuery(equity,  query),
  });
}
