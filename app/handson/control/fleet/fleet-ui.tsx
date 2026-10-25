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

import { cn } from "@/lib/utils";
import type { Health, RevisionSync } from "@/app/lib/fleet/types";

/** Small shared pieces for the fleet board and the docker detail view. */

const HEALTH_STYLE: Record<
  Health,
  { dot: string; text: string; label: string }
> = {
  green: {
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    label: "Healthy",
  },
  amber: {
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    label: "Missed beats",
  },
  red: {
    dot: "bg-red-500",
    text: "text-red-700 dark:text-red-400",
    label: "Not beating",
  },
  unknown: {
    dot: "bg-muted-foreground/40",
    text: "text-muted-foreground",
    label: "No beat expected",
  },
};

export function HealthDot({
  health,
  pulse = true,
}: {
  health: Health;
  pulse?: boolean;
}) {
  const s = HEALTH_STYLE[health];
  return (
    <span className="relative inline-flex h-2.5 w-2.5 shrink-0">
      {pulse && health !== "unknown" && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-40",
            s.dot,
          )}
        />
      )}
      <span
        className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", s.dot)}
      />
    </span>
  );
}

export function HealthLabel({ health }: { health: Health }) {
  const s = HEALTH_STYLE[health];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium",
        s.text,
      )}
    >
      <HealthDot health={health} />
      {s.label}
    </span>
  );
}

export function healthLabel(h: Health) {
  return HEALTH_STYLE[h].label;
}

const SYNC_STYLE: Record<RevisionSync, string> = {
  in_sync:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20",
  pending: "bg-sky-500/10 text-sky-700 dark:text-sky-400 ring-sky-500/20",
  behind:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-500/20",
  none: "bg-muted text-muted-foreground ring-border",
};

const SYNC_LABEL: Record<RevisionSync, string> = {
  in_sync: "in sync",
  pending: "applying",
  behind: "behind",
  none: "no revision",
};

export function RevisionPill({
  desired,
  applied,
  sync,
}: {
  desired?: number;
  applied?: number;
  sync: RevisionSync;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-mono text-sm tabular-nums">
        {applied ?? 0}
        <span className="text-muted-foreground"> / {desired ?? 0}</span>
      </span>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
          SYNC_STYLE[sync],
        )}
      >
        {SYNC_LABEL[sync]}
      </span>
    </span>
  );
}

const STATE_STYLE: Record<string, string> = {
  Running: "text-foreground",
  Provisioning: "text-sky-700 dark:text-sky-400",
  Failed: "text-red-700 dark:text-red-400",
  Stopped: "text-muted-foreground",
  Archived: "text-muted-foreground",
  Removed: "text-muted-foreground line-through",
  Draining: "text-violet-700 dark:text-violet-400",
};

export function StatePill({ state }: { state: string }) {
  return (
    <span
      className={cn(
        "text-xs font-medium uppercase tracking-wider",
        STATE_STYLE[state] || "text-muted-foreground",
      )}
    >
      {state}
    </span>
  );
}

export const TYPE_ACCENT: Record<string, string> = {
  hub: "bg-primary",
  tenant: "bg-blue-500",
  deliveryplatform: "bg-orange-500",
  polaris: "bg-indigo-500",
  supacharge: "bg-lime-500",
};

export function TypeTag({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2 py-0.5 text-xs font-medium">
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          TYPE_ACCENT[type] || "bg-muted-foreground",
        )}
      />
      {type}
    </span>
  );
}

const LIFECYCLE_STYLE: Record<string, string> = {
  Active:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20",
  Lapsed:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-500/20",
  ReadOnly:
    "bg-orange-500/10 text-orange-700 dark:text-orange-400 ring-orange-500/20",
  ExportWindow: "bg-red-500/10 text-red-700 dark:text-red-400 ring-red-500/20",
  Stopped: "bg-muted text-muted-foreground ring-border",
  Archived: "bg-muted text-muted-foreground ring-border",
  Removed: "bg-muted text-muted-foreground ring-border",
};

export function LifecyclePill({ state }: { state?: string | null }) {
  const s = state || "Not set";
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        LIFECYCLE_STYLE[s] || "bg-muted text-muted-foreground ring-border",
      )}
    >
      {s}
    </span>
  );
}

export function DemoBanner({ notice }: { notice?: string }) {
  return (
    <div
      data-tour="fleet-demo"
      className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-2.5 text-sm text-amber-800 dark:text-amber-300"
    >
      <span className="font-medium">Demo data.</span>{" "}
      {notice ||
        "These dockers are fixtures for the guided tour, not the live registry."}
    </div>
  );
}
