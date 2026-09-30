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


// agent_sdk 1.21.0: rokct.ai/opportunities, the page every unknown
// opportunity link falls back to. Lists the open grants, tenders and equity
// funders from the RokctAI/opportunities repo (lib/agent-opportunity-cards).
// agent_sdk 1.21.1: rows come from OpportunityPublicService.rows (backend
// first, GitHub's published/api as its fallback).

import Link from "next/link";

import {
  KIND_LABEL,
  OPPORTUNITY_KINDS,
  openSummaries,
  summariesFromRows,
} from "@/lib/agent-opportunity-cards";
import { OpportunityPublicService } from "@/app/services/public/opportunities";

import { OpportunityList } from "./opportunity-list";

// As app/careers: the host's layout reads headers, so render per request;
// the repo reads are fetch-cached for an hour.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Opportunities | Rokct",
  description: "Open grants, tenders and equity funders, verified by Rokct.",
};

const PER_KIND = 60;

export default async function OpportunitiesPage() {
  const lists = await Promise.all(
    OPPORTUNITY_KINDS.map(async (kind) => ({
      kind,
      items: openSummaries(summariesFromRows(kind, await OpportunityPublicService.rows(kind))),
    })),
  );
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Opportunities</h1>
      <p className="mt-2 text-muted-foreground">
        Open grants, tenders and equity funders. Pick one to see the details and apply.
      </p>
      <nav className="mt-6 flex gap-3 text-sm">
        {lists.map(({ kind, items }) => (
          <Link key={kind} href={`#${kind}`} className="rounded-full border px-3 py-1 hover:bg-muted">
            {KIND_LABEL[kind]} ({items.length})
          </Link>
        ))}
      </nav>
      {lists.map(({ kind, items }) => (
        <section key={kind} id={kind} className="mt-10">
          <h2 className="text-xl font-semibold">{kind === "equity" ? "Equity" : `${KIND_LABEL[kind]}s`}</h2>
          <OpportunityList items={items.slice(0, PER_KIND)} />
          {items.length === 0 && (
            <p className="mt-3 text-sm text-muted-foreground">Nothing open right now.</p>
          )}
        </section>
      ))}
    </main>
  );
}
