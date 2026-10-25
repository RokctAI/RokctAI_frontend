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
  RiDownload2Line,
  RiLoader4Line,
  RiPauseCircleLine,
  RiPlayCircleLine,
  RiArrowGoBackLine,
  RiStopCircleLine,
  RiTimeLine,
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

interface Pending {
  kind: FleetActionKind;
  title: string;
  body: string;
  confirm: string;
  danger?: boolean;
  needsReason?: boolean;
  needsDays?: boolean;
  needsResetFailed?: boolean;
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
  const [pending, setPending] = useState<Pending | null>(null);
  const [rollout, setRollout] = useState("");
  const stopped = /stop/i.test(d.state || "");

  const rolloutAction = (
    kind: FleetActionKind,
    extra: Partial<Pending>,
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
    } as Pending);
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
                  {stopped
                    ? "Stopped. Starting brings every site on it back."
                    : "Stopping takes every site on this docker offline."}
                </p>
              </div>
              {stopped ? (
                <Button
                  size="sm"
                  onClick={() =>
                    setPending({
                      kind: "docker_start",
                      title: `Start ${d.docker_id || d.name}?`,
                      body: "The docker boots and its sites come back once it beats again.",
                      confirm: "Start docker",
                      payload: { docker: d.name },
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
                      title: `Stop ${d.docker_id || d.name}?`,
                      body: `${placements.length} site${placements.length === 1 ? "" : "s"} on this docker will go offline until it is started again.`,
                      confirm: "Stop docker",
                      danger: true,
                      payload: { docker: d.name },
                    })
                  }
                >
                  <RiStopCircleLine className="mr-1.5 h-4 w-4" /> Stop
                </Button>
              )}
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
                  {placements.map((p) => (
                    <li
                      key={p.name}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {p.company}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {p.name}
                        </p>
                      </div>
                      <div className="flex gap-2">
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
                              payload: { subscription: p.name },
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
                              kind: "hub_request_export",
                              title: `Request export for ${p.company}?`,
                              body: "The hub asks the docker to package this tenant's data for download.",
                              confirm: "Request export",
                              payload: { subscription: p.name },
                            })
                          }
                        >
                          <RiDownload2Line className="mr-1.5 h-4 w-4" /> Export
                        </Button>
                      </div>
                    </li>
                  ))}
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

function ConfirmDialog({
  pending,
  onClose,
  onDone,
}: {
  pending: Pending | null;
  onClose: () => void;
  onDone?: () => void;
}) {
  const [reason, setReason] = useState("");
  const [days, setDays] = useState("14");
  const [resetFailed, setResetFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  const daysN = Number(days);
  const daysOk = Number.isInteger(daysN) && daysN >= 1 && daysN <= 90;
  const ready =
    !!pending &&
    (!pending.needsReason || reason.trim().length > 0) &&
    (!pending.needsDays || daysOk);

  const close = () => {
    if (busy) return;
    setReason("");
    setDays("14");
    setResetFailed(false);
    onClose();
  };

  const submit = async () => {
    if (!pending || !ready) return;
    setBusy(true);
    const payload: Record<string, unknown> = { ...pending.payload };
    if (pending.needsReason) payload.reason = reason.trim();
    if (pending.needsDays) payload.days = daysN;
    if (pending.needsResetFailed) payload.reset_failed = resetFailed;
    try {
      const res = await runFleetAction(pending.kind, payload);
      if (res.ok && res.demo) toast.info(res.message, { description: "demo" });
      else if (res.ok) toast.success(res.message);
      else if (res.unavailable)
        toast.warning("Not available yet", { description: res.message });
      else toast.error(res.message);
      if (res.ok) {
        setBusy(false);
        close();
        if (!res.demo) onDone?.();
        return;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    }
    setBusy(false);
  };

  return (
    <Dialog open={!!pending} onOpenChange={(o) => !o && close()}>
      <DialogContent className="sm:max-w-md">
        {pending && (
          <>
            <DialogHeader>
              <DialogTitle>{pending.title}</DialogTitle>
              <DialogDescription>{pending.body}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
                  <Label htmlFor="fleet-reason">Reason</Label>
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
        )}
      </DialogContent>
    </Dialog>
  );
}
