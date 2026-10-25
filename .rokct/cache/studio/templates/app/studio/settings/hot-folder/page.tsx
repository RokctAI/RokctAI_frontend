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

import { getHotFolderStatus, runHotFolder, saveHotFolderSettings } from "@/app/actions/studio/hot-folder/actions";
import { listSheets } from "@/app/actions/studio/prepress/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TEXT_FIELDS: [string, string][] = [
  ["inbox", "Inbox folder (on the server)"],
  ["outbox", "Outbox folder (on the server)"],
  ["format", "Format (e.g. business-card)"],
  ["design_system", "Design system"],
];

export default function HotFolderPage() {
  const [cfg, setCfg] = useState<any>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getHotFolderStatus().then(setCfg).catch(() => toast.error("Could not load settings"));
    listSheets().then((s) => setSheets(Object.keys(s))).catch(() => setSheets([]));
  }, []);

  if (!cfg) return <RiLoader4Line className="m-6 h-6 w-6 animate-spin" />;

  async function save() {
    const { last_run: _ignored, ...values } = cfg;
    setCfg(await saveHotFolderSettings(values));
    toast.success("Saved");
  }

  async function run() {
    setBusy(true);
    try {
      await runHotFolder();
      setCfg(await getHotFolderStatus());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Run failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Hot folder</h1>
      <Card>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!cfg.enabled}
              onChange={(e) => setCfg({ ...cfg, enabled: e.target.checked })}
            />
            Process the inbox automatically
          </label>
          <span />
          {TEXT_FIELDS.map(([key, label]) => (
            <label key={key} className="space-y-1 text-sm">
              <span className="text-muted-foreground">{label}</span>
              <input
                className="w-full rounded-md border px-3 py-2"
                value={cfg[key] ?? ""}
                onChange={(e) => setCfg({ ...cfg, [key]: e.target.value })}
              />
            </label>
          ))}
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Impose onto</span>
            <select
              className="w-full rounded-md border px-3 py-2"
              value={cfg.sheet ?? ""}
              onChange={(e) => setCfg({ ...cfg, sheet: e.target.value })}
            >
              <option value="">No imposition</option>
              {sheets.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </CardContent>
      </Card>
      <div className="flex gap-3">
        <Button variant="outline" onClick={save}>Save</Button>
        <Button onClick={run} disabled={busy}>
          {busy && <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />}
          Run now
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Last run</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {(cfg.last_run ?? []).length === 0 && <p className="text-muted-foreground">Nothing processed yet.</p>}
          {(cfg.last_run ?? []).map((r: any) => (
            <div key={r.source} className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={r.passed ? "outline" : "destructive"}>{r.passed ? "Pass" : "Fail"}</Badge>
                <span className="font-medium">{r.source}</span>
                <span className="text-muted-foreground">{r.score}/100</span>
              </div>
              {r.problems.slice(0, 5).map((p: string, i: number) => (
                <p key={i} className="pl-4 text-muted-foreground">{p}</p>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
