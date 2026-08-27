/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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

import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/custom/header";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/app/(auth)/auth";
import { FiExternalLink } from "react-icons/fi";

const GITHUB_RAW =
  "https://raw.githubusercontent.com/RokctAI/opportunities/main/published/api";

const TYPE_MAP: Record<string, string> = {
  tenders: "tenders.json",
  grants: "grants.json",
  equity: "equity.json",
};

async function getOpportunities(type: string) {
  const file = TYPE_MAP[type];
  if (!file) return null;

  const res = await fetch(`${GITHUB_RAW}/${file}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;

  const list: any[] = await res.json();
  return Array.isArray(list) ? list : (list.data ?? []);
}

export default async function OpportunitiesPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const session = await auth();
  const { type } = await params;
  const opportunities = await getOpportunities(type);

  if (!opportunities) notFound();

  const typeLabel =
    type === "tenders" ? "Tenders" : type === "grants" ? "Grants" : "Equity";

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <Header loginUrl="/login" signupUrl="/register" session={session} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            {typeLabel}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Explore available {typeLabel.toLowerCase()} opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opp, idx) => {
            const slug =
              opp.slug ?? opp.title?.toLowerCase().replace(/\s+/g, "-");
            return (
              <Link
                key={idx}
                href={`/opportunities/${type}/${slug}`}
                className="group p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-purple-500 dark:hover:border-purple-500 transition-all hover:shadow-md"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase tracking-wider py-0"
                      >
                        {typeLabel}
                      </Badge>
                      {opp.status && (
                        <span className="text-[10px] text-zinc-400 capitalize">
                          {opp.status}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-1">
                      {opp.title}
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-1">
                      {opp.organization ??
                        opp.institution ??
                        "Unknown Organization"}
                    </p>
                  </div>
                  <FiExternalLink className="w-4 h-4 text-zinc-300 group-hover:text-purple-500 transition-colors" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-zinc-500 dark:text-zinc-500">
                    {opp.closing_date || opp.deadline ? (
                      <span>Closes: {opp.closing_date || opp.deadline}</span>
                    ) : (
                      <span>No deadline</span>
                    )}
                  </div>
                  {opp.funding_amount && (
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                      {opp.funding_amount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {opportunities.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-500 dark:text-zinc-400">
              No {typeLabel.toLowerCase()} found at the moment.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
