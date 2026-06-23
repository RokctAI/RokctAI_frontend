import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/custom/header";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/app/(auth)/auth";

const GITHUB_RAW = "https://raw.githubusercontent.com/RokctAI/opportunities/main/published/api";

const TYPE_MAP: Record<string, string> = {
  tenders: "tenders.json",
  grants:  "grants.json",
  equity:  "equity.json",
};

async function getOpportunity(type: string, slug: string) {
  const file = TYPE_MAP[type];
  if (!file) return null;

  const res = await fetch(`${GITHUB_RAW}/${file}`, { next: { revalidate: 86400 } });
  if (!res.ok) return null;

  const list: any[] = await res.json();
  return list.find((o) => {
    const itemSlug = o.slug ?? o.title?.toLowerCase().replace(/\s+/g, "-");
    return itemSlug === slug;
  }) ?? null;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</span>
      <span className="text-base text-zinc-800 dark:text-zinc-200">{value}</span>
    </div>
  );
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: { type: string; slug: string };
}) {
  const session = await auth();
  const { type, slug } = params;
  const opp = await getOpportunity(type, slug);

  if (!opp) notFound();

  const title       = opp.title ?? "Untitled";
  const org         = opp.organization ?? opp.institution ?? null;
  const deadline    = opp.closing_date ?? opp.deadline ?? null;
  const amount      = opp.funding_amount ?? null;
  const focus       = opp.focus_area ?? opp.industry ?? opp.tender_type ?? null;
  const province    = opp.province ?? opp.territory ?? opp.country ?? null;
  const contact     = opp.contact_person ?? null;
  const email       = opp.email ?? null;
  const phone       = opp.phone ?? opp.telephone ?? null;
  const website     = opp.website ?? opp.applying_link ?? opp.direct_link ?? null;
  const notes       = opp.notes ?? null;
  const status      = opp.status ?? null;
  const verified    = opp.last_verified ?? null;
  const tenderNum   = opp.tender_number ?? null;
  const briefing    = opp.briefing_date_and_time ?? null;
  const briefingVenue = opp.briefing_venue ?? null;

  const typeLabel = type === "tenders" ? "Tender" : type === "grants" ? "Grant" : "Equity";
  const backLabel = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <Header loginUrl="/login" signupUrl="/register" session={session} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        {/* Back */}
        <Link
          href="/"
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
          {tenderNum   && <Field label="Tender Number"     value={tenderNum} />}
          {deadline    && <Field label="Closing / Deadline" value={deadline} />}
          {amount      && <Field label="Funding Amount"    value={amount} />}
          {focus       && <Field label="Focus / Industry"  value={focus} />}
          {province    && <Field label="Location"          value={province} />}
          {contact     && <Field label="Contact Person"    value={contact} />}
          {email       && <Field label="Email"             value={email} />}
          {phone       && <Field label="Phone"             value={phone} />}
          {verified    && <Field label="Last Verified"     value={verified} />}
        </div>

        {/* Briefing session */}
        {(briefing || briefingVenue) && (
          <div className="rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/10 p-5 mb-8">
            <h2 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 uppercase tracking-wide">
              Briefing Session
            </h2>
            <div className="space-y-2">
              {briefing      && <Field label="Date & Time" value={briefing} />}
              {briefingVenue && <Field label="Venue"       value={briefingVenue} />}
            </div>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-5 mb-8">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-2">Notes</h2>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-line">{notes}</p>
          </div>
        )}

        {/* CTA */}
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            View Official Source ↗
          </a>
        )}
      </main>
    </div>
  );
}
