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
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RiArrowRightSLine,
  RiLoader4Line,
  RiRefreshLine,
  RiServerLine,
} from "@remixicon/react";
import { formatDistanceToNowStrict } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { getFleet } from "@/app/actions/handson/control/fleet/fleet";
import {
  deriveHealth,
  parseFrappeDate,
  revisionSync,
  type DockerRow,
  type Health,
} from "@/app/lib/fleet/types";

import {
  DemoBanner,
  HealthDot,
  healthLabel,
  RevisionPill,
  StatePill,
  TypeTag,
} from "./fleet-ui";

type Filter = "all" | Health;

const REFRESH_MS = 30_000;

export default function FleetBoardPage() {
  const [dockers, setDockers] = useState<DockerRow[]>([]);
  const [demo, setDemo] = useState(false);
  const [notice, setNotice] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [now, setNow] = useState(() => Date.now());

  const fetchData = useCallback(async (quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true);
    try {
      const res = await getFleet();
      setDockers(res.data);
      setDemo(res.demo);
      setNotice(res.notice);
      setNow(Date.now());
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load the fleet",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(() => fetchData(true), REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchData]);

  const enriched = useMemo(
    () =>
      dockers.map((d) => ({
        ...d,
        health: deriveHealth(d, now),
        sync: revisionSync(d),
      })),
    [dockers, now],
  );

  const counts = useMemo(() => {
    const c: Record<Health, number> = {
      green: 0,
      amber: 0,
      red: 0,
      unknown: 0,
    };
    enriched.forEach((d) => c[d.health]++);
    return c;
  }, [enriched]);

  const sites = enriched.reduce((n, d) => n + (d.site_count || 0), 0);
  const behind = enriched.filter((d) => d.sync === "behind").length;

  const byServer = useMemo(() => {
    const groups = new Map<string, typeof enriched>();
    enriched
      .filter((d) => filter === "all" || d.health === filter)
      .forEach((d) => {
        const key = d.server || "Unassigned";
        groups.set(key, [...(groups.get(key) || []), d]);
      });
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [enriched, filter]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <RiLoader4Line className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Control · Fleet
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Fleet board
          </h1>
          <p className="mt-1 text-muted-foreground">
            Every docker the hub knows about, how recently it beat, and whether
            it holds the settings it should.
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => fetchData(true)}
          title="Refresh"
          disabled={refreshing}
        >
          <RiRefreshLine
            className={cn("h-4 w-4", refreshing && "animate-spin")}
          />
        </Button>
      </div>

      {demo && <DemoBanner notice={notice} />}

      <div
        data-tour="fleet-summary"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-5"
      >
        <Stat
          label="Dockers"
          value={enriched.length}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        {(["green", "amber", "red"] as const).map((h) => (
          <Stat
            key={h}
            label={healthLabel(h)}
            value={counts[h]}
            health={h}
            active={filter === h}
            onClick={() => setFilter(filter === h ? "all" : h)}
          />
        ))}
        <Stat
          label="Sites"
          value={sites}
          hint={
            behind
              ? `${behind} docker${behind > 1 ? "s" : ""} behind on settings`
              : "settings in step"
          }
        />
      </div>

      {byServer.length === 0 ? (
        <Card className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
          <RiServerLine className="h-6 w-6" />
          {enriched.length === 0
            ? "No dockers registered yet."
            : "No dockers match this filter."}
        </Card>
      ) : (
        <div data-tour="fleet-list" className="space-y-6">
          {byServer.map(([server, rows]) => (
            <section
              key={server}
              className="overflow-hidden rounded-xl border bg-background"
            >
              <header className="flex items-center justify-between border-b bg-muted/40 px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <RiServerLine className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-sm font-semibold">
                    {server}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {rows.length} docker{rows.length > 1 ? "s" : ""} ·{" "}
                  {rows.reduce((n, d) => n + (d.site_count || 0), 0)} sites
                </span>
              </header>
              <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1.4fr)_minmax(0,0.6fr)_1.5rem] gap-4 px-5 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground md:grid">
                <span>Docker</span>
                <span>State</span>
                <span>Last beat</span>
                <span>Settings applied / desired</span>
                <span className="text-right">Sites</span>
                <span />
              </div>
              <ul className="divide-y">
                {rows.map((d) => {
                  const beat = parseFrappeDate(d.last_heartbeat_at);
                  return (
                    <li key={d.name}>
                      <Link
                        href={`/handson/control/fleet/${encodeURIComponent(d.name)}`}
                        className="group grid grid-cols-2 items-center gap-x-4 gap-y-2 px-5 py-3.5 transition-colors hover:bg-muted/50 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1.4fr)_minmax(0,0.6fr)_1.5rem]"
                      >
                        <span className="col-span-2 flex min-w-0 items-center gap-3 md:col-span-1">
                          <HealthDot health={d.health} />
                          <span className="truncate font-mono text-sm font-medium">
                            {d.docker_id || d.name}
                          </span>
                          <TypeTag type={d.docker_type} />
                        </span>
                        <span className="flex flex-col">
                          <StatePill state={d.state} />
                          <span className="text-xs text-muted-foreground">
                            {d.hosting_tier}
                          </span>
                        </span>
                        <span
                          className="text-sm text-muted-foreground"
                          title={beat?.toLocaleString()}
                        >
                          {beat
                            ? `${formatDistanceToNowStrict(beat, { addSuffix: true })}`
                            : "never"}
                        </span>
                        <RevisionPill
                          desired={d.settings_revision_desired}
                          applied={d.settings_revision_applied}
                          sync={d.sync}
                        />
                        <span className="text-right font-mono text-sm tabular-nums">
                          {d.site_count ?? 0}
                        </span>
                        <RiArrowRightSLine className="hidden h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 md:block" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Health follows the last heartbeat: green within 3 beats, amber after 3
        to 10 missed, red beyond 10. Stopped and archived dockers do not beat.
        Read-only view; refreshes every 30 seconds.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  health,
  hint,
  active,
  onClick,
}: {
  label: string;
  value: number;
  health?: Health;
  hint?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 bg-background px-5 py-4 text-left transition-colors",
        onClick && "hover:bg-muted/50",
        active && "bg-muted/60",
      )}
    >
      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {health && <HealthDot health={health} pulse={false} />}
        {label}
      </span>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </Comp>
  );
}
