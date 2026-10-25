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

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { createDocumentRequest, listDocumentRequests } from "@/app/actions/studio/documents/actions";
import { uploadFile } from "@/app/actions/studio/requests/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { toBase64 } from "../components/to-base64";

const SCOPES = ["Full Suite", "Plan Chapters", "Pitch Deck", "Financial Model", "Briefs"];

// Business documents (plan, pitch deck, financial model, briefs) built
// from an answered questions.md.
export default function DocumentsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [business, setBusiness] = useState("");
  const [scope, setScope] = useState(SCOPES[0]);
  const [questions, setQuestions] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listDocumentRequests().then(setRows);
  }, []);

  async function create() {
    setBusy(true);
    try {
      const questions_file = questions
        ? (await uploadFile(await toBase64(questions), questions.name)).file_url
        : undefined;
      const { name } = await createDocumentRequest({
        business_name: business,
        document_scope: scope,
        questions_file,
      });
      router.push(`/studio/documents/${encodeURIComponent(name)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create the request");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Documents</h1>
      <div className="max-w-2xl space-y-3 rounded-md border p-4">
        <input className="w-full rounded-md border p-2" placeholder="Business name" value={business} onChange={(e) => setBusiness(e.target.value)} />
        <select className="w-full rounded-md border p-2" value={scope} onChange={(e) => setScope(e.target.value)}>
          {SCOPES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <label className="block space-y-1 text-sm">
          <span>Answered questions.md</span>
          <input type="file" accept=".md" onChange={(e) => setQuestions(e.target.files?.[0] ?? null)} />
        </label>
        <Button disabled={!business.trim() || busy} onClick={create}>Create</Button>
      </div>
      <div className="space-y-2">
        {rows.map((r) => (
          <Link key={r.name} href={`/studio/documents/${encodeURIComponent(r.name)}`} className="flex items-center justify-between rounded-md border p-3 hover:border-primary">
            <span>{r.title || r.business_name}</span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              {r.document_scope}
              <Badge variant="outline">{r.status}</Badge>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
