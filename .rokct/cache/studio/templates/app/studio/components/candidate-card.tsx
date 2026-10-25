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

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { renderDeliverable, renderPreview } from "@/app/actions/studio/renders/actions";
import { getCandidateSvg, saveCandidateEdit, selectCandidate } from "@/app/actions/studio/requests/actions";
import type { Candidate, Finding } from "@/app/actions/studio/requests/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ConstructionPanel } from "./construction-panel";
import { ProofPanel } from "./proof-panel";
import { SvgPreview } from "./svg-preview";

function parseFindings(reportJson: string | null): Finding[] {
  try {
    return JSON.parse(reportJson || "{}").findings ?? [];
  } catch {
    return [];
  }
}

/** One candidate: preview, score, select, edit, downloads, guides, proof. */
export function CandidateCard({
  candidate,
  request,
  requestStatus,
  onChange,
}: {
  candidate: Candidate;
  request: string;
  requestStatus: string;
  onChange: () => void;
}) {
  const [svg, setSvg] = useState<string | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [score, setScore] = useState(candidate.score_after);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);

  useEffect(() => {
    if (candidate.svg_url) getCandidateSvg(candidate.name)
        .then((r) => {
          setSvg(r.svg);
          setFindings(parseFindings(r.report_json));
        })
        .catch(() => {});
  }, [candidate.name, candidate.svg_url]);

  async function run(label: string, fn: () => Promise<string>) {
    try {
      const url = await fn();
      setLinks((l) => [...l.filter((x) => x.label !== label), { label, url }]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `${label} failed`);
    }
  }

  async function save() {
    try {
      const out = await saveCandidateEdit(candidate.name, draft);
      setSvg(out.svg);
      setScore(out.score);
      setFindings(parseFindings(out.report_json));
      setEditing(false);
      toast.success(`Saved, score ${out.score.toFixed(1)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    }
  }

  return (
    <Card className={candidate.selected ? "border-primary" : undefined}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">
          Option {candidate.slot}
          {candidate.attempt > 1 && ` (try ${candidate.attempt})`}
        </CardTitle>
        <div className="flex gap-2">
          {score != null && <Badge variant={candidate.passed ? "default" : "destructive"}>{score.toFixed(1)}/100</Badge>}
          {candidate.selected ? <Badge>Selected</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {svg ? (
          <ConstructionPanel candidate={candidate.name}>
            <SvgPreview svg={svg} />
          </ConstructionPanel>
        ) : (
          <p className="text-sm text-muted-foreground">No vector yet.</p>
        )}
        {editing ? (
          <div className="space-y-2">
            <textarea className="h-48 w-full rounded-md border p-2 font-mono text-xs" value={draft} onChange={(e) => setDraft(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={save}>Save and re-check</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          svg && (
            <div className="flex flex-wrap gap-2">
              {requestStatus === "Ready" && !candidate.selected && (
                <Button
                  onClick={() =>
                    selectCandidate(candidate.name, request)
                      .then(onChange)
                      .catch((e) => toast.error(e instanceof Error ? e.message : "Select failed"))
                  }
                >
                  Select
                </Button>
              )}
              <Button variant="outline" onClick={() => { setDraft(svg); setEditing(true); }}>
                Edit SVG
              </Button>
              <Button variant="outline" onClick={() => run("PNG", async () => (await renderPreview(candidate.name)).png_url)}>
                PNG
              </Button>
              <Button variant="outline" onClick={() => run("Press PDF", async () => (await renderDeliverable(candidate.name)).pdf_url)}>
                Press PDF
              </Button>
            </div>
          )
        )}
        {links.length > 0 && (
          <div className="flex flex-wrap gap-3 text-sm">
            {links.map((l) => (
              <a key={l.label} className="underline" href={l.url}>
                {l.label}
              </a>
            ))}
          </div>
        )}
        {findings.length > 0 && (
          <details className="text-sm">
            <summary className="cursor-pointer">What we fixed</summary>
            <ul className="mt-2 space-y-1">
              {findings.map((f, i) => (
                <li key={i} className={f.fixed ? "" : "text-muted-foreground"}>
                  {f.fixed ? "✓ " : f.blocking ? "✕ " : "• "}
                  {f.message}
                </li>
              ))}
            </ul>
          </details>
        )}
        {svg && <ProofPanel candidate={candidate.name} />}
      </CardContent>
    </Card>
  );
}
