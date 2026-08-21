/*
 * Copyright (c) 2026 RokctAI
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

"use client";

import { useState, useTransition } from "react";

import {
  claimTender,
  updateBidStatus,
  updateChecklistItem,
} from "@/app/actions/opportunities/bids";
import type { ChecklistItem, TenderBid } from "@/app/services/control/bids";

const BID_STATUSES = [
  "Watching",
  "Preparing",
  "Submitted",
  "Awarded",
  "Lost",
  "Withdrawn",
];

const STATUS_COLORS: Record<string, string> = {
  Watching: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  Preparing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Submitted:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Awarded:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Lost: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  Withdrawn: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500",
};

export function daysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return null;
  return Math.ceil((target.getTime() - Date.now()) / 86400000);
}

export function DeadlineChip({ closingDate }: { closingDate?: string | null }) {
  const days = daysUntil(closingDate);
  if (days === null) return null;
  const cls =
    days < 0
      ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
      : days <= 7
        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
        : days <= 21
          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  const label =
    days < 0
      ? "Closed"
      : days === 0
        ? "Closes today"
        : `${days} day${days === 1 ? "" : "s"} left`;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

export function BidStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? STATUS_COLORS.Watching}`}
    >
      {status}
    </span>
  );
}

export function BidStatusSelect({
  bidName,
  status,
  onChanged,
}: {
  bidName: string;
  status: string;
  onChanged?: (status: string) => void;
}) {
  const [current, setCurrent] = useState(status);
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={current}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        const prev = current;
        setCurrent(next);
        startTransition(async () => {
          const res: any = await updateBidStatus(bidName, next);
          if (res?.error) {
            setCurrent(prev);
          } else {
            onChanged?.(next);
          }
        });
      }}
      className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-xs text-zinc-700 dark:text-zinc-300 disabled:opacity-50"
    >
      {BID_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

/**
 * Interactive checklist for an entitled subscriber. Starts from either an
 * existing bid (with checklist rows) or an unclaimed state with a
 * "Track this tender" button that claims it.
 */
export function TenderChecklist({
  slug,
  closingDate,
  initialBid,
}: {
  slug: string;
  closingDate?: string | null;
  initialBid: TenderBid | null;
}) {
  const [bid, setBid] = useState<TenderBid | null>(initialBid);
  const [items, setItems] = useState<ChecklistItem[]>(
    initialBid?.checklist ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const done = items.filter((i) => i.status === "Done").length;

  if (!bid) {
    return (
      <div className="rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50 dark:bg-purple-900/10 p-5 mb-8">
        <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-2">
          Response Checklist
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Track this tender to get its response checklist, tick tasks off with
          your team, and follow it through to submission.
        </p>
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const res: any = await claimTender(slug);
              if (res?.error) {
                setError(res.error);
              } else {
                setBid(res);
                setItems(res.checklist ?? []);
              }
            })
          }
          className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 transition-colors disabled:opacity-50"
        >
          {pending ? "Setting up…" : "Track this tender"}
        </button>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-3">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-900/10 p-5 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
          Response Checklist
        </h2>
        <div className="flex items-center gap-2">
          <DeadlineChip closingDate={closingDate ?? bid.closing_date} />
          <BidStatusSelect bidName={bid.name} status={bid.status} />
        </div>
      </div>

      {items.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <span>
              {done} of {items.length} tasks done
            </span>
            <span>{Math.round((done / items.length) * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-purple-600 transition-all"
              style={{ width: `${(done / items.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.name} className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={item.status === "Done"}
              onChange={(e) => {
                const nextDone = e.target.checked;
                setItems((prev) =>
                  prev.map((i) =>
                    i.name === item.name
                      ? { ...i, status: nextDone ? "Done" : "Open" }
                      : i,
                  ),
                );
                startTransition(async () => {
                  const res: any = await updateChecklistItem(
                    bid.name,
                    item.name,
                    nextDone,
                  );
                  if (res?.error) {
                    setItems((prev) =>
                      prev.map((i) =>
                        i.name === item.name
                          ? { ...i, status: nextDone ? "Open" : "Done" }
                          : i,
                      ),
                    );
                    setError(res.error);
                  }
                });
              }}
              className="mt-1 h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-purple-600 focus:ring-purple-500"
            />
            <span
              className={`text-sm ${
                item.status === "Done"
                  ? "text-zinc-400 dark:text-zinc-500 line-through"
                  : "text-zinc-800 dark:text-zinc-200"
              }`}
            >
              {item.task_text}
            </span>
          </li>
        ))}
      </ul>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-3">{error}</p>
      )}
    </div>
  );
}
