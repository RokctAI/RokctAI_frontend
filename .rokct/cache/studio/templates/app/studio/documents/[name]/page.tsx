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

import { use, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { getDocumentStatus, queueDocumentRequest } from "@/app/actions/studio/documents/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Status = Awaited<ReturnType<typeof getDocumentStatus>>;

export default function DocumentRequestPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const [status, setStatus] = useState<Status | null>(null);
  const load = useCallback(() => getDocumentStatus(name).then(setStatus), [name]);

  useEffect(() => {
    load().catch(() => toast.error("Could not load this request"));
  }, [load]);

  useEffect(() => {
    if (!status || !["Queued", "Processing"].includes(status.status)) return;
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [status, load]);

  if (!status) return <p className="p-6">Loading…</p>;
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{name}</h1>
        <Badge variant="outline">{status.status}</Badge>
        {status.completeness != null && <span className="text-sm">{status.completeness}% complete</span>}
      </div>
      {status.status === "Draft" && (
        <Button onClick={() => queueDocumentRequest(name).then(load)}>Start</Button>
      )}
      {status.error_message && <p className="text-sm text-destructive">{status.error_message}</p>}
      {status.warnings && <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{status.warnings}</pre>}
      <ul className="space-y-1 text-sm">
        {status.outputs.map((o) => (
          <li key={o.file_path}>
            <Badge variant="outline" className="mr-2">{o.kind}</Badge>
            {o.file_path}
          </li>
        ))}
      </ul>
    </div>
  );
}
