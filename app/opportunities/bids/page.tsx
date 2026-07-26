import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { TenderBidService, type TenderBid } from "@/app/services/control/bids";
import { Header } from "@/components/custom/header";
import {
  BidStatusSelect,
  DeadlineChip,
} from "@/components/custom/tender-checklist";

export default async function MyBidsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let bids: TenderBid[] | null = null;
  let loadError = false;
  try {
    const res = await TenderBidService.getMyBids();
    bids = Array.isArray(res) ? res : null;
    if (!bids) loadError = true;
  } catch {
    loadError = true;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <Header loginUrl="/login" signupUrl="/register" session={session} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">My Bids</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Tenders you are tracking, soonest closing first.
            </p>
          </div>
          <Link
            href="/opportunities/tenders"
            className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
          >
            Browse tenders →
          </Link>
        </div>

        {loadError && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/10 p-5">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Bid tracking is part of the tender management subscription.{" "}
              <Link href="/landing#pricing" className="text-purple-600 dark:text-purple-400 hover:underline">
                See plans
              </Link>{" "}
              — or if you already subscribe, try signing in again.
            </p>
          </div>
        )}

        {bids && bids.length === 0 && (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-8 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 mb-3">
              You are not tracking any tenders yet.
            </p>
            <Link
              href="/opportunities/tenders"
              className="inline-block rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 transition-colors"
            >
              Find a tender to bid on
            </Link>
          </div>
        )}

        {bids && bids.length > 0 && (
          <div className="flex flex-col gap-4">
            {bids.map((bid) => {
              const total = bid.tasks_total ?? 0;
              const done = bid.tasks_done ?? 0;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <div
                  key={bid.name}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/opportunities/tenders/${bid.tender_slug}`}
                        className="text-base font-semibold text-zinc-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors line-clamp-2"
                      >
                        {bid.tender_title || bid.tender_slug}
                      </Link>
                      {bid.institution && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {bid.institution}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <DeadlineChip closingDate={bid.closing_date} />
                      <BidStatusSelect bidName={bid.name} status={bid.status} />
                    </div>
                  </div>

                  {total > 0 && (
                    <div>
                      <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                        <span>
                          {done} of {total} tasks done
                        </span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-purple-600"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
