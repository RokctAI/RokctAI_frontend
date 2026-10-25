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
import { use, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { getRequestStatus, queueDesignRequest } from "@/app/actions/studio/requests/actions";
import type { RequestStatus } from "@/app/actions/studio/requests/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { CandidateCard } from "../../components/candidate-card";

const WORKING = ["Queued", "Processing"];

export default function RequestPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const [status, setStatus] = useState<RequestStatus | null>(null);

  const load = useCallback(() => getRequestStatus(name).then(setStatus), [name]);

  useEffect(() => {
    load().catch(() => toast.error("Could not load this request"));
  }, [load]);

  // Poll while the pipeline is still working on it.
  useEffect(() => {
    if (!status || !WORKING.includes(status.status)) return;
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [status, load]);

  if (!status) return <p className="p-6">Loading…</p>;
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{name}</h1>
        <Badge variant="outline">{status.status}</Badge>
        {WORKING.includes(status.status) && <RiLoader4Line className="h-4 w-4 animate-spin" />}
      </div>
      {status.error_message && <p className="text-sm text-destructive">{status.error_message}</p>}
      {status.status === "Draft" && (
        <Button onClick={() => queueDesignRequest(name).then(load)}>Start processing</Button>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        {status.candidates.map((c) => (
          <CandidateCard key={c.name} candidate={c} request={name} requestStatus={status.status} onChange={load} />
        ))}
      </div>
    </div>
  );
}
