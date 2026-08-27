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
import { FiExternalLink, FiLock } from "react-icons/fi";
import { TenderBidService } from "@/app/services/control/bids";
import {
  TenderChecklist,
  DeadlineChip,
} from "@/components/custom/tender-checklist";

const GITHUB_RAW =
  "https://raw.githubusercontent.com/RokctAI/opportunities/main/published/api";

const TYPE_MAP: Record<string, string> = {
  tenders: "tenders.json",
  grants: "grants.json",
  equity: "equity.json",
};

async function getOpportunity(type: string, slug: string) {
  const file = TYPE_MAP[type];
  if (!file) return null;

  const res = await fetch(`${GITHUB_RAW}/${file}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;

  const list: any[] = await res.json();
  return (
    list.find((o) => {
      const itemSlug = o.slug ?? o.title?.toLowerCase().replace(/\s+/g, "-");
      return itemSlug === slug;
    }) ?? null
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </span>
      <span className="text-base text-zinc-800 dark:text-zinc-200">
        {value}
      </span>
    </div>
  );
}

// Teaser data comes from the same published meta.json the catalog uses. Only
// the COUNT of advanced tasks is ever passed on for non-entitled viewers —
// never the task content.
async function getTeaserInfo(slug: string) {
  try {
    const res = await fetch(`${GITHUB_RAW}/meta.json`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return { teaserTasks: DEFAULT_TEASER_TASKS, advancedCount: 0 };
    const meta = await res.json();
    const entry = meta?.advanced_enrichment?.[slug];
    const teaserTasks = Array.isArray(meta?.global_defaults)
      ? meta.global_defaults.map((t: string) => t.split("|")[0].trim())
      : DEFAULT_TEASER_TASKS;
    return { teaserTasks, advancedCount: entry?.tasks?.length ?? 0 };
  } catch {
    return { teaserTasks: DEFAULT_TEASER_TASKS, advancedCount: 0 };
  }
}

const DEFAULT_TEASER_TASKS = [
  "Review Tender Documents",
  "Prepare Initial Response",
];

async function TenderTasksSection({
  slug,
  closingDate,
  loggedIn,
}: {
  slug: string;
  closingDate?: string | null;
  loggedIn: boolean;
}) {
  // Entitlement is decided server-side by the control plane; a failed call
  // (no session, no API keys, plan without tenders) degrades to the teaser.
  // Reads go through the service directly — the server actions revalidate
  // paths, which is not allowed during render.
  let detail: any = null;
  if (loggedIn) {
    try {
      detail = await TenderBidService.getTenderDetail(slug);
    } catch {
      detail = null;
    }
  }

  if (detail?.entitled) {
    // claim_tender is idempotent: with an existing bid it just returns the
    // full doc including checklist rows. Without one, the client component
    // shows the "Track this tender" button instead.
    let fullBid: any = null;
    if (detail.bid) {
      try {
        fullBid = await TenderBidService.claimTender(slug);
      } catch {
        fullBid = null;
      }
    }
    return (
      <TenderChecklist
        slug={slug}
        closingDate={closingDate}
        initialBid={fullBid}
      />
    );
  }

  const { teaserTasks, advancedCount } = await getTeaserInfo(slug);
  const tasks: string[] =
    detail?.tasks?.map((t: any) => t.task_text) ?? teaserTasks;

  return (
    <div className="rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50 dark:bg-purple-900/10 p-5 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
          Response Checklist
        </h2>
        <DeadlineChip closingDate={closingDate} />
      </div>

      <ul className="flex flex-col gap-2 mb-4">
        {tasks.map((task, i) => (
          <li
            key={i}
            className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400"
          >
            <span className="mt-0.5 h-4 w-4 shrink-0 rounded border border-zinc-300 dark:border-zinc-600" />
            {task}
          </li>
        ))}
        {advancedCount > 0 && (
          <li className="flex items-start gap-3 text-sm text-zinc-400 dark:text-zinc-500 italic">
            <FiLock className="mt-0.5 h-4 w-4 shrink-0" />
            {advancedCount} tender-specific compliance tasks (SBD/MBD forms,
            evaluation criteria, required certificates) — prepared for
            subscribers
          </li>
        )}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={loggedIn ? "/landing#pricing" : "/login"}
          className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          {loggedIn
            ? "Upgrade to unlock the full checklist"
            : "Sign in to unlock the full checklist"}
        </Link>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Track bids, tick off compliance tasks, and never miss a closing date.
        </span>
      </div>
    </div>
  );
}

function isValidPhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const trimmed = phone.trim();
  if (!trimmed) return false;
  if (trimmed.includes("## Source")) return false;
  // Check if it's just zeros
  if (/^0+$/.test(trimmed.replace(/[\s\-\(\)]/g, ""))) return false;
  return true;
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ type: string; slug: string }>;
}) {
  const session = await auth();
  const { type, slug } = await params;
  const opp = await getOpportunity(type, slug);

  if (!opp) notFound();

  const title = opp.title ?? "Untitled";
  const org = opp.organization ?? opp.institution ?? null;
  const deadline = opp.closing_date ?? opp.deadline ?? null;
  const amount = opp.funding_amount ?? null;
  const focus = opp.focus_area ?? opp.industry ?? opp.tender_type ?? null;
  const province = opp.province ?? opp.territory ?? opp.country ?? null;
  const contact = opp.contact_person ?? null;
  const email = opp.email ?? null;
  const phone = isValidPhone(opp.phone ?? opp.telephone)
    ? (opp.phone ?? opp.telephone)
    : null;
  const website = opp.website ?? opp.applying_link ?? opp.direct_link ?? null;
  const notes = opp.notes ?? null;
  const status = opp.status ?? null;
  const verified = opp.last_verified ?? null;
  const tenderNum = opp.tender_number ?? null;
  const briefing = opp.briefing_date_and_time ?? null;
  const briefingVenue = opp.briefing_venue ?? null;

  const typeLabel =
    type === "tenders" ? "Tender" : type === "grants" ? "Grant" : "Equity";
  const backLabel = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <Header loginUrl="/login" signupUrl="/register" session={session} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        {/* Back */}
        <Link
          href={`/opportunities/${type}`}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-8 transition-colors"
        >
          ← Back to {backLabel}
        </Link>

        {/* Header card */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6 mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0">
              {typeLabel}
            </Badge>
            {status && (
              <Badge variant="outline" className="capitalize text-xs">
                {status}
              </Badge>
            )}
          </div>

          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white leading-snug mb-2">
            {title}
          </h1>

          {org && (
            <p className="text-base text-zinc-600 dark:text-zinc-400">{org}</p>
          )}
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {tenderNum && <Field label="Tender Number" value={tenderNum} />}
          {deadline && <Field label="Closing / Deadline" value={deadline} />}
          {amount && <Field label="Funding Amount" value={amount} />}
          {focus && <Field label="Focus / Industry" value={focus} />}
          {province && <Field label="Location" value={province} />}
          {contact && <Field label="Contact Person" value={contact} />}
          {email && <Field label="Email" value={email} />}
          {phone && <Field label="Phone" value={phone} />}
          {verified && <Field label="Last Verified" value={verified} />}
        </div>

        {/* Response checklist (tenders only): teaser for free users, interactive for subscribers */}
        {type === "tenders" && (
          <TenderTasksSection
            slug={slug}
            closingDate={deadline}
            loggedIn={!!session?.user}
          />
        )}

        {/* Documents & Links */}
        {(() => {
          const links: { label: string; url: string }[] = [];

          if (type !== "equity") {
            if (opp.links && Array.isArray(opp.links)) {
              opp.links.forEach((l: any) => {
                if (l.url)
                  links.push({ label: l.title || "Document", url: l.url });
              });
            }
            if (opp.direct_link)
              links.push({ label: "Direct Link", url: opp.direct_link });
            if (opp.applying_link)
              links.push({ label: "Applying Link", url: opp.applying_link });
            if (opp.website) links.push({ label: "Website", url: opp.website });
          } else {
            // For equity, prioritize website/linkedin and avoid source links
            if (opp.website) links.push({ label: "Website", url: opp.website });
            if (opp.linkedin)
              links.push({ label: "LinkedIn", url: opp.linkedin });
          }

          if (links.length === 0) return null;

          return (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-5 mb-8">
              <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
                Document Links
              </h2>
              <div className="flex flex-col gap-2">
                {links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                  >
                    <FiExternalLink className="w-3 h-3" />
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Briefing session */}
        {(briefing || briefingVenue) && (
          <div className="rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/10 p-5 mb-8">
            <h2 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 uppercase tracking-wide">
              Briefing Session
            </h2>
            <div className="space-y-2">
              {briefing && <Field label="Date & Time" value={briefing} />}
              {briefingVenue && <Field label="Venue" value={briefingVenue} />}
            </div>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-5 mb-8">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-2">
              Notes
            </h2>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
              {notes}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
