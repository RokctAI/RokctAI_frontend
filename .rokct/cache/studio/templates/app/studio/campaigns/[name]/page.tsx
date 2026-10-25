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
import { use, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { getCampaignStatus, startCampaign } from "@/app/actions/studio/campaigns/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ProofPanel } from "../../components/proof-panel";

type Status = Awaited<ReturnType<typeof getCampaignStatus>>;

export default function CampaignPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const [status, setStatus] = useState<Status | null>(null);
  const load = useCallback(() => getCampaignStatus(name).then(setStatus), [name]);

  useEffect(() => {
    load().catch(() => toast.error("Could not load this campaign"));
  }, [load]);

  useEffect(() => {
    if (status?.status !== "Processing") return;
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [status, load]);

  async function start() {
    try {
      await startCampaign(name);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start");
    }
  }

  if (!status) return <p className="p-6">Loading…</p>;
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{name}</h1>
        <Badge variant="outline">{status.status}</Badge>
        {status.status === "Draft" && status.master_request && <Button onClick={start}>Start</Button>}
      </div>
      {status.error_message && <p className="text-sm text-destructive">{status.error_message}</p>}
      {status.master_request ? (
        <Link className="text-sm underline" href={`/studio/requests/${encodeURIComponent(status.master_request)}`}>
          Master design
        </Link>
      ) : (
        <p className="text-sm text-muted-foreground">No master design linked yet.</p>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {status.formats.map((f) => (
          <Card key={f.format}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">{f.format}</CardTitle>
              <Badge variant="outline">{f.request_status || f.action || "Pending"}</Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {f.candidate ? (
                <>
                  <div>
                    Score {f.candidate.score_after?.toFixed(1) ?? "–"}
                    {f.candidate.passed ? "" : " (below target)"}
                  </div>
                  <ProofPanel candidate={f.candidate.name} />
                </>
              ) : (
                <div className="text-muted-foreground">Not laid out yet.</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
