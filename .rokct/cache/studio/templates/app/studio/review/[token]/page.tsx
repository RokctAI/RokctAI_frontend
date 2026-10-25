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

"use client";

import { use, useEffect, useState } from "react";

import { getReview, submitReview } from "@/app/actions/studio/proofs/actions";
import { Button } from "@/components/ui/button";

// Public page: the link in proof emails. No login; the token is the key.
export default function ReviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [review, setReview] = useState<any>(undefined);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReview(token).then((r) => setReview(r ?? null));
  }, [token]);

  async function decide(decision: string) {
    setError(null);
    try {
      const out = await submitReview(token, decision, comment);
      setDone(out?.status ?? decision);
    } catch {
      setError("We could not record your answer. Please try again.");
    }
  }

  if (review === undefined) return <p className="p-6">Loading your proof…</p>;
  if (review === null)
    return <p className="p-6">This review link is invalid, expired or has been withdrawn.</p>;

  const answered = done ?? (review.status !== "Pending" ? review.status : null);
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{review.title}</h1>
      {review.svg && (
        // Engine-generated SVG, rendered sandboxed: no scripts run in the preview.
        <iframe
          title="Proof"
          sandbox=""
          className="h-[60vh] w-full rounded-md border bg-white"
          srcDoc={`<html><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh">${review.svg.replace("<svg", '<svg style="max-width:100%;max-height:100%"')}</body></html>`}
        />
      )}
      <p className="text-sm text-muted-foreground">
        Please check spelling, numbers, contact details, colours and layout. Colours on screen differ
        from the final print. Printing starts only after approval.
      </p>
      {answered ? (
        <p className="font-medium">Thank you. Your answer was recorded: {answered}.</p>
      ) : (
        <div className="space-y-3">
          <textarea
            className="w-full rounded-md border p-3"
            rows={3}
            placeholder="Changes or comments (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => decide("Approved")}>Approve</Button>
            <Button variant="outline" onClick={() => decide("Changes Requested")}>
              Request changes
            </Button>
            <Button variant="outline" onClick={() => decide("Rejected")}>
              Reject
            </Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </main>
  );
}
