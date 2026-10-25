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
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { imposeClientPdf, listSheets, preflightPdf } from "@/app/actions/studio/prepress/actions";
import type { PreflightReport } from "@/app/actions/studio/prepress/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PreflightPage() {
  const [report, setReport] = useState<PreflightReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [sheets, setSheets] = useState<string[]>([]);
  const [sheet, setSheet] = useState("SRA3");
  const [quantity, setQuantity] = useState<number | undefined>();
  const [imposed, setImposed] = useState<string | null>(null);

  useEffect(() => {
    listSheets().then((s) => setSheets(Object.keys(s))).catch(() => setSheets(["SRA3"]));
  }, []);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setImposed(null);
    try {
      setReport(await preflightPdf(await toBase64(file), file.name));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Preflight failed");
    } finally {
      setBusy(false);
    }
  }

  async function impose() {
    if (!report?.file_url) return;
    setBusy(true);
    try {
      const out = await imposeClientPdf(report.file_url, sheet, quantity);
      setImposed(out.pdf_url);
      toast.success(`${out.layout.per_sheet} up on ${out.layout.sheet}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Imposition failed");
    } finally {
      setBusy(false);
    }
  }

  const open = report?.findings.filter((f) => !f.fixed) ?? [];
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Check a client PDF</h1>
      <input type="file" accept="application/pdf" onChange={(e) => onFile(e.target.files?.[0])} />
      {busy && <RiLoader4Line className="h-5 w-5 animate-spin" />}
      {report && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">
              {report.blocked ? "Not ready for press" : open.length ? "Ready, with warnings" : "Ready for press"}
            </CardTitle>
            <Badge variant={report.blocked ? "destructive" : "outline"}>{report.score}/100</Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {open.map((f, i) => (
              <p key={i} className={f.blocking ? "text-red-600" : "text-amber-600"}>
                {f.blocking ? "Blocker" : "Warning"}: {f.message}
              </p>
            ))}
            {!report.blocked && (
              <div className="flex flex-wrap items-end gap-3 pt-4">
                <select className="rounded-md border px-3 py-2" value={sheet} onChange={(e) => setSheet(e.target.value)}>
                  {sheets.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <input
                  className="w-32 rounded-md border px-3 py-2"
                  type="number"
                  placeholder="Quantity"
                  value={quantity ?? ""}
                  onChange={(e) => setQuantity(Number(e.target.value) || undefined)}
                />
                <Button onClick={impose} disabled={busy}>Impose</Button>
                {imposed && <a className="underline" href={imposed}>Imposed sheet</a>}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
