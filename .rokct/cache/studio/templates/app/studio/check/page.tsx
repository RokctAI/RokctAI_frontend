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

import { RiLoader4Line } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { auditUpload, complyUpload, uploadFile } from "@/app/actions/studio/requests/actions";
import type { Finding } from "@/app/actions/studio/requests/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { SystemFormatFields } from "../components/system-format-fields";
import { toBase64 } from "../components/to-base64";



// Check any artwork against the brand, then fix it (trace + snap to the
// design system) without generating anything new.
export default function CheckArtworkPage() {
  const router = useRouter();
  const [system, setSystem] = useState("");
  const [format, setFormat] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [busy, setBusy] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const { file_url } = await uploadFile(await toBase64(file), file.name);
      setFileUrl(file_url);
      const report = await auditUpload(file_url, system || undefined);
      setScore(report.score);
      setFindings(JSON.parse(report.report_json || "{}").findings ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Check failed");
    } finally {
      setBusy(false);
    }
  }

  async function fix() {
    if (!fileUrl) return;
    setBusy(true);
    try {
      const out = await complyUpload(fileUrl, system || undefined, format || undefined);
      router.push(`/studio/requests/${encodeURIComponent(out.name!)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fix failed");
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-5 p-6">
      <h1 className="text-2xl font-semibold">Check artwork</h1>
      <SystemFormatFields system={system} onSystem={setSystem} format={format} onFormat={setFormat} allowNoFormat />
      <input type="file" accept=".png,.jpg,.jpeg,.webp,.svg" onChange={(e) => onFile(e.target.files?.[0])} />
      {busy && <RiLoader4Line className="h-5 w-5 animate-spin" />}
      {score != null && (
        <div className="space-y-3">
          <div className="text-lg font-medium">Score {score.toFixed(1)}/100</div>
          <ul className="space-y-1 text-sm">
            {findings.map((f, i) => (
              <li key={i} className="flex gap-2">
                <Badge variant={f.blocking || f.severity === "error" ? "destructive" : "outline"}>{f.severity}</Badge>
                <span>{f.message}</span>
              </li>
            ))}
          </ul>
          <Button disabled={busy} onClick={fix}>Fix to brand</Button>
        </div>
      )}
    </div>
  );
}
