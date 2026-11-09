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

import { useState } from "react";
import {
  RiArrowGoBackLine,
  RiDeleteBin6Line,
  RiDownload2Line,
  RiFileCopyLine,
  RiKey2Line,
  RiLoader4Line,
  RiPauseCircleLine,
  RiPlayCircleLine,
  RiRefreshLine,
  RiStopCircleLine,
  RiTimeLine,
  RiTruckLine,
} from "@remixicon/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { runFleetAction } from "@/app/actions/handson/control/fleet/fleet-actions";
import type { FleetActionKind } from "@/app/services/control/fleet-actions";
import type { DockerDetail } from "@/app/lib/fleet/types";

export const DOCKER_TYPES = [
  "hub",
  "tenant",
  "deliveryplatform",
  "polaris",
  "supacharge",
];

export interface PendingAction {
  kind: FleetActionKind;
  title: string;
  body: string;
  confirm: string;
  danger?: boolean;
  /** Reason field, required unless reasonOptional. */
  needsReason?: boolean;
  reasonOptional?: boolean;
  needsDays?: boolean;
  needsResetFailed?: boolean;
  /** move_plan: target docker, quiet hours, dedicated switch. */
  needsMove?: boolean;
  /** hub_issue_enrolment_token for a new docker: pick its type. */
  needsDockerType?: boolean;
  payload: Record<string, unknown>;
}

export function FleetActions({
  detail,
  onDone,
}: {
  detail: DockerDetail;
  onDone?: () => void;
}) {
  const { docker: d, placements } = detail;
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [rollout, setRollout] = useState("");
  const archived = d.state === "Archived";
  const stopped = /stop/i.test(d.state || "");
  const label = d.docker_id || d.name;

  const rolloutAction = (
    kind: FleetActionKind,
    extra: Partial<PendingAction>,
  ): void => {
    const r = rollout.trim();
    if (!r) {
      toast.error("Enter a rollout id first.");
      return;
    }
    setPending({
      kind,
      title: "",
      body: "",
      confirm: "",
      ...extra,
      payload: { rollout: r },
    } as PendingAction);
  };

  return (
    <>
      <div data-tour="fleet-actions" className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Staff actions</CardTitle>
            <CardDescription>
              Changes go to the hub as signed commands and are logged with your
              name. System Managers only.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Docker power</p>
                <p className="text-xs text-muted-foreground">
                  {archived
                    ? "Archived. Restoring brings its volumes back from the archive snapshot, then starts it."
                    : stopped
                      ? "Stopped. Starting brings every site on it back."
                      : "Stopping takes every site on this docker offline."}
                </p>
              </div>
              {archived ? (
                <Button
                  size="sm"
                  onClick={() =>
                    setPending({
                      kind: "docker_restore",
                      title: `Restore ${label}?`,
                      body: "The server agent restores the volumes from the archive snapshot and starts the docker. Its Archived tenants go Active once the start is acked.",
                      confirm: "Restore docker",
                      needsReason: true,
                      reasonOptional: true,
                      payload: { docker_id: d.name },
                    })
                  }
                >
                  <RiArrowGoBackLine className="mr-1.5 h-4 w-4" /> Restore
                </Button>
              ) : stopped ? (
                <Button
                  size="sm"
                  onClick={() =>
                    setPending({
                      kind: "docker_start",
                      title: `Start ${label}?`,
                      body: "The docker boots and its sites come back once it beats again.",
                      confirm: "Start docker",
                      payload: { docker_id: d.name },
                    })
                  }
                >
                  <RiPlayCircleLine className="mr-1.5 h-4 w-4" /> Start
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-500/40 text-red-600 hover:bg-red-500/10 hover:text-red-700"
                  onClick={() =>
                    setPending({
                      kind: "docker_stop",
                      title: `Stop ${label}?`,
                      body: `${placements.length} site${placements.length === 1 ? "" : "s"} on this docker will go offline until it is started again.`,
                      confirm: "Stop docker",
                      danger: true,
                      payload: { docker_id: d.name },
                    })
                  }
                >
                  <RiStopCircleLine className="mr-1.5 h-4 w-4" /> Stop
                </Button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Docker key</p>
                <p className="text-xs text-muted-foreground">
                  Rotate the docker&apos;s signing key on its next beat, or
                  issue a one-time token to enrol it again.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setPending({
                      kind: "hub_rotate_key",
                      title: `Rotate the key of ${label}?`,
                      body: "The docker gets rotate_key on its next heartbeat. Its old key stays valid for one interval after it acks the new one.",
                      confirm: "Rotate key",
                      payload: { docker_id: d.name },
                    })
                  }
                >
                  <RiRefreshLine className="mr-1.5 h-4 w-4" /> Rotate
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setPending({
                      kind: "hub_issue_enrolment_token",
                      title: `Enrolment token for ${label}`,
                      body: "A one-time token, valid for 24 hours, to enrol this docker again. It is shown once.",
                      confirm: "Issue token",
                      payload: {
                        docker_id: d.name,
                        docker_type: d.docker_type,
                      },
                    })
                  }
                >
                  <RiKey2Line className="mr-1.5 h-4 w-4" /> Token
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Per site
              </p>
              {placements.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No sites to act on.
                </p>
              ) : (
                <ul className="divide-y rounded-lg border">
                  {placements.map((p) => {
                    const sub = p.subscription || p.name;
                    const siteArchived = p.lifecycle_state === "Archived";
                    return (
                      <li
                        key={p.name}
                        className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {p.company}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {sub}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {siteArchived ? (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setPending({
                                    kind: "docker_restore",
                                    title: `Restore ${p.company}?`,
                                    body: "Brings the Archived tenant back. On a dedicated docker its volumes are restored from the archive snapshot first; it goes Active once the docker is running.",
                                    confirm: "Restore",
                                    needsReason: true,
                                    reasonOptional: true,
                                    payload: { subscription: sub },
                                  })
                                }
                              >
                                <RiArrowGoBackLine className="mr-1.5 h-4 w-4" />{" "}
                                Restore
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                onClick={() =>
                                  setPending({
                                    kind: "lifecycle_remove",
                                    title: `Remove ${p.company}?`,
                                    body: "Moves the Archived tenant to Removed. Its archive is no longer kept for a restore.",
                                    confirm: "Remove tenant",
                                    danger: true,
                                    needsReason: true,
                                    payload: { subscription: sub },
                                  })
                                }
                              >
                                <RiDeleteBin6Line className="mr-1.5 h-4 w-4" />{" "}
                                Remove
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setPending({
                                    kind: "lifecycle_extend",
                                    title: `Extend ${p.company}`,
                                    body: "Pushes the next lifecycle step back. Use for agreed grace periods.",
                                    confirm: "Extend",
                                    needsDays: true,
                                    needsReason: true,
                                    payload: { subscription: sub },
                                  })
                                }
                              >
                                <RiTimeLine className="mr-1.5 h-4 w-4" /> Extend
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setPending({
                                    kind: "move_plan",
                                    title: `Move ${p.company}`,
                                    body: "Plans a red/green move. The tenant is told before it may start; leave the target empty to let placement pick one.",
                                    confirm: "Plan move",
                                    needsMove: true,
                                    payload: { subscription: sub },
                                  })
                                }
                              >
                                <RiTruckLine className="mr-1.5 h-4 w-4" /> Move
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setPending({
                                kind: "hub_request_export",
                                title: `Request export for ${p.company}?`,
                                body: "The hub asks the docker to package this tenant's data for download.",
                                confirm: "Request export",
                                payload: { subscription: sub },
                              })
                            }
                          >
                            <RiDownload2Line className="mr-1.5 h-4 w-4" />{" "}
                            Export
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        <Card data-tour="fleet-rollouts" className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Rollouts</CardTitle>
            <CardDescription>
              Drive a build rollout by its id. Pausing stops new dockers picking
              it up; rollback returns them to the previous lock.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="fleet-rollout">Rollout</Label>
              <Input
                id="fleet-rollout"
                placeholder="ROLLOUT-0001"
                className="font-mono"
                value={rollout}
                onChange={(e) => setRollout(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                onClick={() =>
                  rolloutAction("rollout_start", {
                    title: "Start rollout?",
                    body: "Dockers in scope begin moving to the new build in waves.",
                    confirm: "Start",
                    needsResetFailed: true,
                  })
                }
              >
                <RiPlayCircleLine className="mr-1 h-4 w-4" /> Start
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  rolloutAction("rollout_pause", {
                    title: "Pause rollout?",
                    body: "Dockers already updated stay put; the rest wait.",
                    confirm: "Pause",
                    needsReason: true,
                  })
                }
              >
                <RiPauseCircleLine className="mr-1 h-4 w-4" /> Pause
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() =>
                  rolloutAction("rollout_rollback", {
                    title: "Roll back?",
                    body: "Every docker this rollout touched returns to its previous build.",
                    confirm: "Roll back",
                    danger: true,
                  })
                }
              >
                <RiArrowGoBackLine className="mr-1 h-4 w-4" /> Rollback
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        pending={pending}
        onClose={() => setPending(null)}
        onDone={onDone}
      />
    </>
  );
}

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function ConfirmDialog({
  pending,
  onClose,
  onDone,
}: {
  pending: PendingAction | null;
  onClose: () => void;
  onDone?: () => void;
}) {
  const [reason, setReason] = useState("");
  const [days, setDays] = useState("14");
  const [resetFailed, setResetFailed] = useState(false);
  const [toDocker, setToDocker] = useState("");
  const [quietHours, setQuietHours] = useState("");
  const [dedicated, setDedicated] = useState(false);
  const [dockerType, setDockerType] = useState("");
  const [issued, setIssued] = useState<Record<string, unknown> | null>(null);
  const [busy, setBusy] = useState(false);

  const daysN = Number(days);
  const daysOk = Number.isInteger(daysN) && daysN >= 1 && daysN <= 90;
  const ready =
    !!pending &&
    (!pending.needsReason ||
      pending.reasonOptional ||
      reason.trim().length > 0) &&
    (!pending.needsDays || daysOk) &&
    (!pending.needsDockerType || !!dockerType);

  const close = () => {
    if (busy) return;
    setReason("");
    setDays("14");
    setResetFailed(false);
    setToDocker("");
    setQuietHours("");
    setDedicated(false);
    setDockerType("");
    setIssued(null);
    onClose();
  };

  const submit = async () => {
    if (!pending || !ready) return;
    setBusy(true);
    const payload: Record<string, unknown> = { ...pending.payload };
    if (pending.needsReason && reason.trim()) payload.reason = reason.trim();
    if (pending.needsDays) payload.days = daysN;
    if (pending.needsResetFailed) payload.reset_failed = resetFailed;
    if (pending.needsDockerType) payload.docker_type = dockerType;
    if (pending.needsMove) {
      if (toDocker.trim()) payload.to_docker = toDocker.trim();
      if (quietHours.trim()) payload.quiet_hour_window = quietHours.trim();
      if (dedicated) payload.dedicated = 1;
    }
    try {
      const res = await runFleetAction(pending.kind, payload);
      if (res.ok && res.demo) toast.info(res.message, { description: "demo" });
      else if (res.ok) toast.success(res.message);
      else if (res.unavailable)
        toast.warning("Not available yet", { description: res.message });
      else toast.error(res.message);
      if (res.ok) {
        setBusy(false);
        if (!res.demo) onDone?.();
        if (typeof res.data?.enrolment_token === "string") {
          // Shown once; the hub keeps only its hash.
          setIssued({ ...res.data, demo: !!res.demo });
          return;
        }
        close();
        return;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    }
    setBusy(false);
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Token copied");
    } catch {
      toast.error("Copy failed; select the token and copy it by hand.");
    }
  };

  return (
    <Dialog open={!!pending} onOpenChange={(o) => !o && close()}>
      <DialogContent className="sm:max-w-md">
        {pending && issued ? (
          <>
            <DialogHeader>
              <DialogTitle>Enrolment token</DialogTitle>
              <DialogDescription>
                Copy it now: it is shown once and the hub keeps only its hash.
                {issued.demo ? " Demo token; it enrols nothing." : ""}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={String(issued.enrolment_token)}
                  className="font-mono text-xs"
                  onFocus={(e) => e.currentTarget.select()}
                />
                <Button
                  size="icon"
                  variant="outline"
                  title="Copy"
                  onClick={() => copy(String(issued.enrolment_token))}
                >
                  <RiFileCopyLine className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {issued.docker_id
                  ? `Docker ${String(issued.docker_id)}`
                  : issued.server
                    ? `Server ${String(issued.server)}`
                    : ""}
                {issued.expires_at
                  ? ` · expires ${String(issued.expires_at)}`
                  : ""}
              </p>
            </div>
            <DialogFooter>
              <Button onClick={close}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          pending && (
            <>
              <DialogHeader>
                <DialogTitle>{pending.title}</DialogTitle>
                <DialogDescription>{pending.body}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {pending.needsDockerType && (
                  <div className="space-y-1.5">
                    <Label htmlFor="fleet-docker-type">Docker type</Label>
                    <select
                      id="fleet-docker-type"
                      className={selectClass}
                      value={dockerType}
                      onChange={(e) => setDockerType(e.target.value)}
                    >
                      <option value="">Pick a type</option>
                      {DOCKER_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {pending.needsMove && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="fleet-to-docker">
                        Target docker (optional)
                      </Label>
                      <Input
                        id="fleet-to-docker"
                        placeholder="Placement picks one"
                        className="font-mono"
                        value={toDocker}
                        onChange={(e) => setToDocker(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="fleet-quiet">
                        Quiet hours (optional)
                      </Label>
                      <Input
                        id="fleet-quiet"
                        placeholder="01:00-03:00"
                        className="w-40 font-mono"
                        value={quietHours}
                        onChange={(e) => setQuietHours(e.target.value)}
                      />
                    </div>
                    <label className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm">
                      <span>
                        New dedicated docker
                        <span className="block text-xs text-muted-foreground">
                          With no target, placement creates a dedicated docker
                          instead of picking a shared one.
                        </span>
                      </span>
                      <Switch
                        checked={dedicated}
                        onCheckedChange={setDedicated}
                      />
                    </label>
                  </>
                )}
                {pending.needsDays && (
                  <div className="space-y-1.5">
                    <Label htmlFor="fleet-days">Days (1 to 90)</Label>
                    <Input
                      id="fleet-days"
                      type="number"
                      min={1}
                      max={90}
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      className={cn("w-28", !daysOk && "border-red-500")}
                    />
                  </div>
                )}
                {pending.needsResetFailed && (
                  <label className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm">
                    <span>
                      Retry failed dockers
                      <span className="block text-xs text-muted-foreground">
                        Clears earlier failures so they are attempted again.
                      </span>
                    </span>
                    <Switch
                      checked={resetFailed}
                      onCheckedChange={setResetFailed}
                    />
                  </label>
                )}
                {pending.needsReason && (
                  <div className="space-y-1.5">
                    <Label htmlFor="fleet-reason">
                      Reason{pending.reasonOptional ? " (optional)" : ""}
                    </Label>
                    <Textarea
                      id="fleet-reason"
                      rows={3}
                      placeholder="Recorded in the audit log"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={close} disabled={busy}>
                  Cancel
                </Button>
                <Button
                  onClick={submit}
                  disabled={!ready || busy}
                  variant={pending.danger ? "destructive" : "default"}
                >
                  {busy && (
                    <RiLoader4Line className="mr-1.5 h-4 w-4 animate-spin" />
                  )}
                  {pending.confirm}
                </Button>
              </DialogFooter>
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}
