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

import { useState } from "react";
import { toast } from "sonner";

import { createApprovalLink, createProof, sendProof } from "@/app/actions/studio/proofs/actions";
import { Button } from "@/components/ui/button";

/** Proof + client sign-off for one candidate: download or email the proof. */
export function ProofPanel({ candidate }: { candidate: string }) {
  const [approval, setApproval] = useState<string | null>(null);
  const [recipients, setRecipients] = useState("");
  const [message, setMessage] = useState("");
  const [links, setLinks] = useState<{ proof_url: string; review_url: string } | null>(null);

  async function ensureApproval() {
    if (approval) return approval;
    const link = await createApprovalLink(candidate);
    setApproval(link.name);
    return link.name;
  }

  async function download() {
    setLinks(await createProof(await ensureApproval()));
  }

  async function email() {
    try {
      const out = await sendProof(await ensureApproval(), recipients, message);
      setLinks(out);
      toast.success(`Proof sent to ${out.sent_to.join(", ")}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send the proof");
    }
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap gap-2">
        <input
          className="min-w-64 flex-1 rounded-md border px-3 py-2"
          placeholder="client@company.co.za, other@company.co.za"
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
        />
        <Button onClick={email} disabled={!recipients.trim()}>Email proof</Button>
        <Button variant="outline" onClick={download}>Download proof</Button>
      </div>
      <textarea
        className="w-full rounded-md border p-3"
        rows={2}
        placeholder="Message to the client (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      {links && (
        <div className="flex gap-4">
          <a className="underline" href={links.proof_url}>Proof PDF</a>
          <a className="underline" href={links.review_url}>Review page</a>
        </div>
      )}
    </div>
  );
}
