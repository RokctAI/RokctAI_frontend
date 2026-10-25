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
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

import { listSheets } from "@/app/actions/studio/prepress/actions";
import type { Layout } from "@/app/actions/studio/prepress/types";
import { getPrintJob, preparePrintJob, updatePrintJob } from "@/app/actions/studio/print-jobs/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FIELDS: [string, string, string][] = [
  ["quantity", "Quantity", "number"],
  ["stock", "Stock / paper", "text"],
  ["final_size", "Finished size", "text"],
  ["sides", "Sides", "text"],
  ["material_finish", "Finish", "text"],
  ["due_date", "Due date", "date"],
];

export default function PrintJobPage({ params }: { params: Promise<{ job: string }> }) {
  const { job: jobName } = use(params);
  const name = decodeURIComponent(jobName);
  const [job, setJob] = useState<any>(null);
  const [sheets, setSheets] = useState<Record<string, [number, number]>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getPrintJob(name).then(setJob).catch(() => toast.error("Could not load the print job"));
    listSheets().then(setSheets).catch(() => setSheets({}));
  }, [name]);

  if (!job) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RiLoader4Line className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const set = (key: string, value: unknown) => setJob({ ...job, [key]: value });

  async function save() {
    const values = Object.fromEntries(
      [...FIELDS.map(([k]) => k), "sheet"].map((k) => [k, job[k] ?? null]),
    );
    setJob(await updatePrintJob(name, values));
    toast.success("Saved");
  }

  async function makeReady() {
    setBusy(true);
    try {
      await save();
      const out = await preparePrintJob(name, job.sheet || undefined, job.quantity || undefined);
      setJob({ ...(await getPrintJob(name)), layout: out.layout });
      toast.success("Press-ready files made");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not prepare the job");
    } finally {
      setBusy(false);
    }
  }

  const layout: Layout | null = job.layout;
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{job.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {FIELDS.map(([key, label, type]) => (
            <label key={key} className="space-y-1 text-sm">
              <span className="text-muted-foreground">{label}</span>
              <input
                className="w-full rounded-md border px-3 py-2"
                type={type}
                value={job[key] ?? ""}
                onChange={(e) =>
                  set(key, type === "number" ? Number(e.target.value) || null : e.target.value)
                }
              />
            </label>
          ))}
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Press sheet</span>
            <select
              className="w-full rounded-md border px-3 py-2"
              value={job.sheet ?? ""}
              onChange={(e) => set("sheet", e.target.value)}
            >
              <option value="">No imposition</option>
              {Object.entries(sheets).map(([sheet, [w, h]]) => (
                <option key={sheet} value={sheet}>
                  {sheet} ({w} x {h} mm)
                </option>
              ))}
            </select>
          </label>
        </CardContent>
      </Card>
      <div className="flex gap-3">
        <Button variant="outline" onClick={save} disabled={busy}>
          Save
        </Button>
        <Button onClick={makeReady} disabled={busy}>
          {busy && <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />}
          Make press-ready
        </Button>
      </div>
      {(job.press_pdf || job.ticket_pdf) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {layout && (
              <p>
                {layout.cols} x {layout.rows} = {layout.per_sheet} up on {layout.sheet}
                {layout.rotated ? " (rotated)" : ""}, {Math.round(layout.usage * 100)}% of the
                sheet used{layout.sheets ? `, ${layout.sheets} sheets` : ""}.
              </p>
            )}
            <div className="flex flex-wrap gap-4">
              {job.press_pdf && <a className="underline" href={job.press_pdf}>Press PDF</a>}
              {job.imposed_pdf && <a className="underline" href={job.imposed_pdf}>Imposed sheet</a>}
              {job.ticket_pdf && <a className="underline" href={job.ticket_pdf}>Job ticket</a>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
