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

// Hub error dashboard (Ray 2026-11-22, render approved). Hub only: error rows
// name our files, functions and lines, so tenants never see them. One line per
// bug across all tenants; open one to see its steps, request ID and version.
// Server half: app/actions/handson/control/errors/errors.ts.
// Sidebar entry: the shell's app/handson/layout.tsx controlItems.

import { useCallback, useEffect, useState } from "react";

import { HubTheme } from "@/components/custom/hub/hub-theme";
import { tx } from "@/app/lib/i18n/phrases";
import { getErrorBoard, markErrorSeen } from "@/app/actions/handson/control/errors/errors";
import type { ErrorBoard, ErrorBug } from "@/app/services/control/errors";

const REFRESH_MS = 60_000;

function ago(when: string): string {
  const t = Date.parse(when.replace(" ", "T"));
  if (Number.isNaN(t)) return when;
  const mins = Math.max(0, Math.round((Date.now() - t) / 60_000));
  if (mins < 60) return tx("{n} min ago").replace("{n}", String(mins));
  const hours = Math.round(mins / 60);
  if (hours < 48) return tx("{n} h ago").replace("{n}", String(hours));
  return tx("{n} days ago").replace("{n}", String(Math.round(hours / 24)));
}

function Tile({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="hub-card p-4">
      <div className="hub-muted text-sm">{label}</div>
      <div className={`mt-1 text-3xl font-semibold tabular-nums ${tone ?? ""}`}>{value}</div>
    </div>
  );
}

export default function ErrorBoardPage() {
  const [data, setData] = useState<ErrorBoard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    const out = await getErrorBoard();
    setData(out.data);
    setError(out.error ?? null);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  const seen = async (b: ErrorBug) => {
    const out = await markErrorSeen(b.fingerprint);
    if (!out.success) setError(out.error ?? null);
    await load();
  };

  const picked = data?.rows.find((r) => r.fingerprint === open) ?? null;
  const tenants =
    data?.tenants_total != null
      ? tx("{a} of {b}").replace("{a}", String(data.tenants_affected)).replace("{b}", String(data.tenants_total))
      : String(data?.tenants_affected ?? 0);

  return (
    <HubTheme className="min-h-full p-6 md:p-10 space-y-6">
      <header className="space-y-2">
        <div className="hub-kicker">{tx("Hub")}</div>
        <h1 className="text-3xl md:text-4xl">{tx("Errors, all tenants")}</h1>
        <p className="hub-muted">
          {tx("Where each error happened, how often and on which version. Secrets and customer data are removed at the source; customers show by ID only.")}
        </p>
      </header>

      {error && <div className="hub-error">{error}</div>}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Tile label={tx("Errors in the last 24 hours")} value={data?.errors_24h ?? 0} tone="text-red-600" />
        <Tile label={tx("Different bugs")} value={data?.bugs ?? 0} tone="text-amber-600" />
        <Tile label={tx("Tenants affected")} value={tenants} />
        <Tile label={tx("Tenants down now")} value={data?.tenants_down ?? 0} tone={data?.tenants_down ? "text-red-600" : "text-green-700"} />
      </div>

      <div className="hub-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="hub-muted text-left">
              <th className="p-3">{tx("Where it happened (file : function : line)")}</th>
              <th className="p-3">{tx("Error")}</th>
              <th className="p-3">{tx("Tenants")}</th>
              <th className="p-3">{tx("Times")}</th>
              <th className="p-3">{tx("Last seen")}</th>
              <th className="p-3">{tx("Version")}</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {(data?.rows ?? []).length === 0 && (
              <tr>
                <td className="p-3 hub-muted" colSpan={7}>{tx("No errors. All quiet.")}</td>
              </tr>
            )}
            {(data?.rows ?? []).map((b) => (
              <tr key={b.fingerprint} className="cursor-pointer border-t" onClick={() => setOpen(b.fingerprint)}>
                <td className="p-3"><code>{b.where.split(":").join(" : ")}</code></td>
                <td className="p-3">{b.error.split(":")[0]}</td>
                <td className="p-3 tabular-nums">{b.tenants}</td>
                <td className="p-3 tabular-nums">{b.times}</td>
                <td className="p-3">{ago(b.last_seen)}</td>
                <td className="p-3">{b.version ?? "?"}{b.commit ? ` (${b.commit.slice(0, 7)})` : ""}</td>
                <td className="p-3">{b.seen ? <span className="hub-muted">{tx("Seen")}</span> : <span className="hub-error">{tx("New")}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {picked && (
        <div className="hub-card p-5 space-y-2">
          <h2 className="text-xl font-semibold">{tx("Open")}: {picked.where.split(":").join(" : ")}</h2>
          <div>
            {picked.error}
            {picked.request_id && <> · {tx("request")} <code>{picked.request_id}</code></>}
            {picked.reference && <> · {picked.reference[0]} <code>{picked.reference[1]}</code> ({tx("ID only")})</>}
          </div>
          {picked.path && <div>{tx("Path")}: <code>{picked.path}</code></div>}
          {picked.frames.length > 0 && (
            <div>
              {tx("Steps")}: {picked.frames.map((f) => `${f.file} : ${f.function} : ${f.line}`).join(" → ")}
            </div>
          )}
          {!picked.seen && (
            <button type="button" className="hub-tab" aria-selected onClick={() => seen(picked)}>
              {tx("Mark seen")}
            </button>
          )}
        </div>
      )}
    </HubTheme>
  );
}
