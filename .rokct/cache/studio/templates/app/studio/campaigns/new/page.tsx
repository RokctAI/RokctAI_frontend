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

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { createCampaign } from "@/app/actions/studio/campaigns/actions";
import { listRequests } from "@/app/actions/studio/requests/actions";
import { listFormats } from "@/app/actions/studio/systems/actions";
import type { Format } from "@/app/actions/studio/systems/types";
import { Button } from "@/components/ui/button";

import { SystemFormatFields } from "../../components/system-format-fields";

// One approved master design re-laid out for many formats.
export default function NewCampaignPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [system, setSystem] = useState("");
  const [master, setMaster] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [formats, setFormats] = useState<Format[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listFormats().then(setFormats);
    listRequests().then((r) => setRequests(r.filter((x: any) => ["Ready", "Delivered"].includes(x.status))));
  }, []);

  async function create() {
    setBusy(true);
    try {
      const { name } = await createCampaign({
        formats: picked,
        title: title || undefined,
        brief,
        design_system: system || undefined,
        master_request: master || undefined,
      });
      router.push(`/studio/campaigns/${encodeURIComponent(name)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create the campaign");
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-5 p-6">
      <h1 className="text-2xl font-semibold">New campaign</h1>
      <input className="w-full rounded-md border p-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className="w-full rounded-md border p-3" rows={3} placeholder="Brief" value={brief} onChange={(e) => setBrief(e.target.value)} />
      <SystemFormatFields system={system} onSystem={setSystem} />
      <label className="block space-y-1 text-sm">
        <span>Master design</span>
        <select className="w-full rounded-md border p-2" value={master} onChange={(e) => setMaster(e.target.value)}>
          <option value="">Link later</option>
          {requests.map((r) => (
            <option key={r.name} value={r.name}>
              {r.title || r.name}
            </option>
          ))}
        </select>
      </label>
      <div className="space-y-2">
        <div className="text-sm">Formats</div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {formats.map((f) => (
            <label key={f.name} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={picked.includes(f.name)}
                onChange={(e) => setPicked((p) => (e.target.checked ? [...p, f.name] : p.filter((x) => x !== f.name)))}
              />
              {f.name} <span className="text-muted-foreground">{f.width}×{f.height}</span>
            </label>
          ))}
        </div>
      </div>
      <Button disabled={picked.length === 0 || busy} onClick={create}>Create</Button>
    </div>
  );
}
