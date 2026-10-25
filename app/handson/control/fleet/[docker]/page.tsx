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
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { RiArrowLeftLine, RiLoader4Line } from "@remixicon/react";
import { format, formatDistanceToNowStrict } from "date-fns";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { getDockerDetail } from "@/app/actions/handson/control/fleet/fleet";
import { canRunFleetActions } from "@/app/actions/handson/control/fleet/fleet-actions";
import {
  deriveHealth,
  parseFrappeDate,
  revisionSync,
  type DockerDetail,
} from "@/app/lib/fleet/types";

import {
  DemoBanner,
  HealthLabel,
  LifecyclePill,
  RevisionPill,
  StatePill,
  TypeTag,
} from "../fleet-ui";
import { FleetActions } from "../fleet-actions-ui";

const when = (v?: string | null, fmt = "d MMM, HH:mm") => {
  const d = parseFrappeDate(v);
  return d ? format(d, fmt) : "—";
};

const ago = (v?: string | null) => {
  const d = parseFrappeDate(v);
  return d ? formatDistanceToNowStrict(d, { addSuffix: true }) : "never";
};

const num = (n?: number) => (n == null ? "—" : n.toLocaleString());

export default function DockerDetailPage() {
  const params = useParams<{ docker: string }>();
  const name = decodeURIComponent(params.docker);
  const [detail, setDetail] = useState<DockerDetail | null>(null);
  const [demo, setDemo] = useState(false);
  const [notice, setNotice] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [canAct, setCanAct] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getDockerDetail(name);
      setDetail(res.data);
      setDemo(res.demo);
      setNotice(res.notice);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load the docker",
      );
    } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    canRunFleetActions()
      .then(setCanAct)
      .catch(() => setCanAct(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <RiLoader4Line className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-4 p-8">
        <BackLink />
        <p className="text-muted-foreground">
          No docker named {name} in the registry.
        </p>
        {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
      </div>
    );
  }

  const { docker: d, usage, revisions, placements } = detail;
  const health = deriveHealth(d);
  const peakRequests = Math.max(1, ...usage.map((u) => u.requests || 0));

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-4">
        <BackLink />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-mono text-3xl font-bold tracking-tight">
                {d.docker_id || d.name}
              </h1>
              <TypeTag type={d.docker_type} />
            </div>
            <p className="mt-1 text-muted-foreground">
              On <span className="font-mono text-foreground">{d.server}</span> ·{" "}
              {d.hosting_tier} ·{" "}
              {d.ownership === "Customer"
                ? "customer hardware"
                : "own hardware"}
            </p>
          </div>
          <HealthLabel health={health} />
        </div>
      </div>

      {demo && <DemoBanner notice={notice} />}

      <dl
        data-tour="fleet-detail-facts"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-4"
      >
        <Fact label="State">
          <StatePill state={d.state} />
          <span className="text-xs text-muted-foreground">
            since {when(d.state_since, "d MMM yyyy")}
          </span>
        </Fact>
        <Fact label="Last beat">
          <span className="text-sm font-medium">
            {ago(d.last_heartbeat_at)}
          </span>
          <span className="text-xs text-muted-foreground">
            {when(d.last_heartbeat_at)}
          </span>
        </Fact>
        <Fact label="Settings applied / desired">
          <RevisionPill
            desired={d.settings_revision_desired}
            applied={d.settings_revision_applied}
            sync={revisionSync(d)}
          />
        </Fact>
        <Fact label="Build">
          <span className="text-sm font-medium">{d.app_version || "—"}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {d.template || "—"} @ {d.lock_sha || "—"}
          </span>
        </Fact>
      </dl>

      {canAct && <FleetActions detail={detail} onDone={load} />}

      <Card data-tour="fleet-placements">
        <CardHeader>
          <CardTitle>Sites and lifecycle</CardTitle>
          <CardDescription>
            Tenants placed on this docker and where each stands in its
            lifecycle. System Managers can extend a site or request its export
            from the Staff actions card.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Billing status</TableHead>
                <TableHead>Lifecycle</TableHead>
                <TableHead>Since</TableHead>
                <TableHead>Next step</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placements.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-20 text-center text-muted-foreground"
                  >
                    {d.docker_type === "hub"
                      ? "The hub serves no tenant sites."
                      : "No sites placed here."}
                  </TableCell>
                </TableRow>
              ) : (
                placements.map((p) => (
                  <TableRow key={p.name}>
                    <TableCell className="font-medium">
                      {p.company}
                      {p.site_name && (
                        <div className="text-xs font-normal text-muted-foreground">
                          {p.site_name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.plan || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.status || "—"}
                    </TableCell>
                    <TableCell>
                      <LifecyclePill state={p.lifecycle_state} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {when(p.state_entered_at, "d MMM")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.next_transition_at
                        ? when(p.next_transition_at, "d MMM")
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card data-tour="fleet-usage" className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Usage samples</CardTitle>
            <CardDescription>
              Daily totals the docker reports with its beat. This is all the hub
              receives about activity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead className="w-[30%]">Requests</TableHead>
                  <TableHead className="text-right">Active users</TableHead>
                  <TableHead className="text-right">Storage</TableHead>
                  <TableHead className="text-right">CPU s</TableHead>
                  <TableHead className="text-right">Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usage.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-20 text-center text-muted-foreground"
                    >
                      No samples yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  usage.map((u) => (
                    <TableRow key={u.date}>
                      <TableCell className="whitespace-nowrap">
                        {when(u.date, "EEE d MMM")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary/70"
                              style={{
                                width: `${((u.requests || 0) / peakRequests) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="w-16 text-right font-mono text-xs tabular-nums">
                            {num(u.requests)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {num(u.users_active)}
                        <span className="text-muted-foreground">
                          {" "}
                          / {num(u.users_total)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {u.storage_gb != null ? `${u.storage_gb} GB` : "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {num(u.cpu_seconds)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right tabular-nums",
                          (u.errors || 0) > 10 && "font-semibold text-red-600",
                        )}
                      >
                        {num(u.errors)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card data-tour="fleet-revisions" className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Settings revisions</CardTitle>
            <CardDescription>
              What the hub asked this docker to hold, newest first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {revisions.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No revisions issued.
              </p>
            ) : (
              <ol className="relative space-y-5 border-l pl-5">
                {revisions.map((r) => {
                  const applied =
                    !!r.applied_at &&
                    (r.apply_result || "applied").startsWith("applied");
                  const failed =
                    !!r.apply_result && !r.apply_result.startsWith("applied");
                  return (
                    <li key={r.name} className="relative">
                      <span
                        className={cn(
                          "absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-background",
                          applied
                            ? "bg-emerald-500"
                            : failed
                              ? "bg-red-500"
                              : "bg-sky-500",
                        )}
                      />
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-mono text-sm font-semibold">
                          r{r.revision}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {when(r.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {r.created_by || "—"} ·{" "}
                        {applied
                          ? `applied ${when(r.applied_at, "HH:mm")}`
                          : failed
                            ? r.apply_result
                            : "waiting for the docker"}
                      </p>
                      {r.diff && (
                        <pre className="mt-1.5 overflow-x-auto rounded-md bg-muted px-2.5 py-1.5 font-mono text-[11px] leading-relaxed">
                          {r.diff}
                        </pre>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/handson/control/fleet"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <RiArrowLeftLine className="h-4 w-4" /> Fleet board
    </Link>
  );
}

function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 bg-background px-5 py-4">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="flex flex-col gap-0.5">{children}</dd>
    </div>
  );
}
