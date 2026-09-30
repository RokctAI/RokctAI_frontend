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


// agent_sdk 1.21.0: rokct.ai/opportunities/<grants|tenders|equity>/<slug>.
// A slug the repo has renders its card with the apply button on the page;
// a closed one says so and lists what is still open; any other link
// redirects to /opportunities. The host's root layout reads headers, so the
// route renders per request; the repo reads behind it are fetch-cached for
// an hour, so new cards appear without a rebuild.
// agent_sdk 1.21.1: rows come from OpportunityPublicService (backend first,
// GitHub's published/api as its fallback), never from the markdown cards.

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  KIND_LABEL,
  OPPORTUNITY_KINDS,
  type OpportunityKind,
  isClosed,
  isOpportunityKind,
  cardForSlug,
  openSummaries,
  summariesFromRows,
} from "@/lib/agent-opportunity-cards";
import { OpportunityPublicService } from "@/app/services/public/opportunities";

import { OpportunityList } from "../../opportunity-list";

// As app/legal/[id]: the host's layout reads headers, so render per request.
export const dynamic = "force-dynamic";


type Params = Promise<{ type: string; slug: string }>;

async function resolve(params: Params) {
  const { type, slug } = await params;
  if (!isOpportunityKind(type)) return null;
  const key = decodeURIComponent(slug);
  return cardForSlug(type, key, await OpportunityPublicService.bySlug(type, key));
}

async function loadSummaries(kind: OpportunityKind) {
  return summariesFromRows(kind, await OpportunityPublicService.rows(kind));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const card = await resolve(params);
  if (!card) return { title: "Opportunities | Rokct" };
  return {
    title: `${card.title} | Rokct`,
    description: `${KIND_LABEL[card.kind]} opportunity${card.organization ? ` from ${card.organization}` : ""}.`,
  };
}

// Open ones of the same kind; when none are, open ones of any kind
// (grants.json can lag the cards).
async function openElsewhere(kind: OpportunityKind, slug: string) {
  const same = openSummaries(await loadSummaries(kind), new Date(), slug);
  if (same.length > 0) return same.slice(0, 10);
  const all = await Promise.all(OPPORTUNITY_KINDS.map((k) => loadSummaries(k)));
  return openSummaries(all.flat(), new Date(), slug).slice(0, 10);
}

function isUrl(value: string) {
  return /^https?:\/\//.test(value);
}

export default async function OpportunityPage({ params }: { params: Params }) {
  const card = await resolve(params);
  if (!card) redirect("/opportunities");

  const closed = isClosed(card.deadline);
  const stillOpen = closed ? await openElsewhere(card.kind, card.slug) : [];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <Link href="/opportunities" className="text-sm text-muted-foreground hover:underline">
        All opportunities
      </Link>
      <p className="mt-4 text-sm uppercase tracking-wide text-muted-foreground">
        {KIND_LABEL[card.kind]}
      </p>
      <h1 className="mt-1 text-3xl font-semibold">{card.title}</h1>
      {card.organization && <p className="mt-2 text-muted-foreground">{card.organization}</p>}

      {closed ? (
        <div className="mt-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3">
          {`This closed on ${card.deadline}.`}
        </div>
      ) : (
        card.applyUrl && (
          <a
            href={card.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:opacity-90"
          >
            Apply
          </a>
        )
      )}

      {card.sections.map((section) => (
        <section key={section.heading} className="mt-8">
          <h2 className="text-lg font-semibold">{section.heading}</h2>
          {section.fields.length > 0 && (
            <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-[12rem_1fr]">
              {section.fields.map((f, i) => (
                <div key={`${f.label}-${i}`} className="contents">
                  <dt className="text-sm text-muted-foreground">{f.label}</dt>
                  <dd className="break-words">
                    {f.value ? (
                      isUrl(f.value) ? (
                        <a href={f.value} target="_blank" rel="noopener noreferrer" className="underline">
                          {f.value}
                        </a>
                      ) : (
                        f.value
                      )
                    ) : (
                      "-"
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {section.text.map((t, i) => (
            <p key={i} className="mt-3 leading-relaxed">
              {t}
            </p>
          ))}
        </section>
      ))}

      {closed && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">Still open</h2>
          <OpportunityList items={stillOpen} />
          <Link href="/opportunities" className="mt-4 inline-block text-sm underline">
            See all opportunities
          </Link>
        </section>
      )}
    </main>
  );
}
