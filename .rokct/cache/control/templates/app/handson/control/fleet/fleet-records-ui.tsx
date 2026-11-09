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
  RiCloseCircleLine,
  RiKey2Line,
  RiRefreshLine,
  RiServerLine,
  RiTimeLine,
} from "@remixicon/react";
import { format, formatDistanceToNowStrict } from "date-fns";

import { Button } from "@/components/ui/button";
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

import {
  MOVE_ABORTABLE,
  canRollbackMove,
  parseFrappeDate,
  type CompanyLinkRow,
  type Health,
  type MoveJobRow,
  type ServerAgentRow,
  type ServerSummary,
} from "@/app/lib/fleet/types";

import { ConfirmDialog, type PendingAction } from "./fleet-actions-ui";
import { HealthDot, LinkStatePill, MoveStatePill } from "./fleet-ui";

/**
 * Read-only records around the dockers (server agents, moves, company links)
 * with their staff actions. `actionable` is false when the page shows
 * fallback fixtures or the user is not a System Manager.
 */

const when = (v?: string | null, fmt = "d MMM, HH:mm") => {
  const d = parseFrappeDate(v);
  return d ? format(d, fmt) : "—";
};

const ago = (v?: string | null) => {
  const d = parseFrappeDate(v);
  return d ? formatDistanceToNowStrict(d, { addSuffix: true }) : "never";
};

const agentHealth = (s?: string | null): Health =>
  s === "green" || s === "amber" || s === "red" ? s : "unknown";

export function ServerAgentsCard({
  agents,
  servers,
  actionable,
  onDone,
}: {
  agents: ServerAgentRow[] | null;
  servers: ServerSummary[];
  actionable: boolean;
  onDone?: () => void;
}) {
  const [pending, setPending] = useState<PendingAction | null>(null);
  const byServer = new Map((agents || []).map((a) => [a.server || a.name, a]));
  const names = [
    ...new Set([
      ...servers.map((s) => s.name).filter(Boolean),
      ...byServer.keys(),
    ]),
  ].sort();

  return (
    <Card data-tour="fleet-servers">
      <CardHeader>
        <CardTitle>Servers and agents</CardTitle>
        <CardDescription>
          The server agent on each machine runs stop, start, snapshot and
          restore for its dockers. Issue a token to enrol an agent or a new
          docker, or rotate an agent&apos;s key.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {agents === null && <Unread what="Server Agent" />}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Server</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Last beat</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead>Key rotated</TableHead>
              {actionable && <TableHead className="text-right" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {names.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={actionable ? 6 : 5}
                  className="h-20 text-center text-muted-foreground"
                >
                  No servers registered yet.
                </TableCell>
              </TableRow>
            ) : (
              names.map((server) => {
                const a = byServer.get(server);
                return (
                  <TableRow key={server}>
                    <TableCell>
                      <span className="flex items-center gap-2 font-mono text-sm font-medium">
                        <RiServerLine className="h-4 w-4 text-muted-foreground" />
                        {server}
                      </span>
                    </TableCell>
                    <TableCell>
                      {a ? (
                        <span className="flex items-center gap-2 text-sm">
                          <HealthDot
                            health={agentHealth(a.agent_status)}
                            pulse={false}
                          />
                          {a.agent_version || "—"}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {agents === null ? "—" : "no agent"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell
                      className="text-muted-foreground"
                      title={when(a?.last_beat_at)}
                    >
                      {a ? ago(a.last_beat_at) : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {when(a?.enrolled_at, "d MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {when(a?.key_rotated_at, "d MMM yyyy")}
                    </TableCell>
                    {actionable && (
                      <TableCell>
                        <div className="flex flex-wrap justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setPending({
                                kind: "server_issue_enrolment_token",
                                title: `Agent token for ${server}`,
                                body: "A one-time token, valid for 24 hours, for the server agent's install.sh. It is shown once.",
                                confirm: "Issue token",
                                payload: { server },
                              })
                            }
                          >
                            <RiKey2Line className="mr-1.5 h-4 w-4" /> Agent
                            token
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setPending({
                                kind: "hub_issue_enrolment_token",
                                title: `New docker on ${server}`,
                                body: "A one-time token, valid for 24 hours, for a new docker on this server to enrol with the hub. It is shown once.",
                                confirm: "Issue token",
                                needsDockerType: true,
                                payload: { server },
                              })
                            }
                          >
                            <RiKey2Line className="mr-1.5 h-4 w-4" /> Docker
                            token
                          </Button>
                          {a && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setPending({
                                  kind: "server_rotate_key",
                                  title: `Rotate the agent key on ${server}?`,
                                  body: "The agent gets rotate_key on its next heartbeat and acks with its new key.",
                                  confirm: "Rotate key",
                                  payload: { server },
                                })
                              }
                            >
                              <RiRefreshLine className="mr-1.5 h-4 w-4" />{" "}
                              Rotate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
      <ConfirmDialog
        pending={pending}
        onClose={() => setPending(null)}
        onDone={onDone}
      />
    </Card>
  );
}

function Unread({ what }: { what: string }) {
  return (
    <p className="py-6 text-center text-sm text-muted-foreground">
      Could not read {what} from the hub.
    </p>
  );
}

export function MovesCard({
  docker,
  moves,
  actionable,
  onDone,
}: {
  docker: string;
  moves: MoveJobRow[] | null;
  actionable: boolean;
  onDone?: () => void;
}) {
  const [pending, setPending] = useState<PendingAction | null>(null);

  return (
    <Card data-tour="fleet-moves" className="xl:col-span-3">
      <CardHeader>
        <CardTitle>Moves</CardTitle>
        <CardDescription>
          Red/green moves from or to this docker. A planned move can be
          postponed once; any move can be aborted before the switch. A switched
          move can be rolled back to its old docker while the old site is kept.
          Plan a move from a site in Staff actions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {moves === null ? (
          <Unread what="Move Job" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subscription</TableHead>
                <TableHead>From → to</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Not before</TableHead>
                {actionable && <TableHead className="text-right" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {moves.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={actionable ? 5 : 4}
                    className="h-20 text-center text-muted-foreground"
                  >
                    No moves for this docker.
                  </TableCell>
                </TableRow>
              ) : (
                moves.map((m) => {
                  const open = MOVE_ABORTABLE.includes(m.state);
                  const canPostpone = m.state === "planned" && !m.postponed;
                  const canRollback = canRollbackMove(m);
                  return (
                    <TableRow key={m.name}>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {m.subscription}
                        </span>
                        <div className="font-mono text-xs text-muted-foreground">
                          {m.name}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <span
                          className={
                            m.from_docker === docker
                              ? "font-semibold"
                              : "text-muted-foreground"
                          }
                        >
                          {m.from_docker || "—"}
                        </span>
                        {" → "}
                        <span
                          className={
                            m.to_docker === docker
                              ? "font-semibold"
                              : "text-muted-foreground"
                          }
                        >
                          {m.to_docker || "placement"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex flex-col items-start gap-0.5">
                          <MoveStatePill state={m.state} />
                          {m.postponed && (
                            <span className="text-xs text-muted-foreground">
                              postponed once
                            </span>
                          )}
                          {m.abort_reason && (
                            <span className="text-xs text-muted-foreground">
                              {m.abort_reason}
                            </span>
                          )}
                          {m.state === "switched" && m.red_kept_until && (
                            <span className="text-xs text-muted-foreground">
                              rollback until {when(m.red_kept_until)}
                            </span>
                          )}
                          {m.rollback_reason && (
                            <span className="text-xs text-muted-foreground">
                              rollback: {m.rollback_reason}
                            </span>
                          )}
                          {m.rollback_error && m.state === "switched" && (
                            <span className="text-xs text-red-600">
                              last rollback stopped: {m.rollback_error}
                            </span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {when(m.not_before)}
                        {m.quiet_hour_window && (
                          <div className="text-xs">
                            quiet {m.quiet_hour_window}
                          </div>
                        )}
                      </TableCell>
                      {actionable && (
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            {canPostpone && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setPending({
                                    kind: "move_postpone",
                                    title: `Postpone ${m.name}?`,
                                    body: "Pushes the move back by the notice period and tells the tenant. A move can be postponed once.",
                                    confirm: "Postpone",
                                    payload: { move_job: m.name },
                                  })
                                }
                              >
                                <RiTimeLine className="mr-1.5 h-4 w-4" />{" "}
                                Postpone
                              </Button>
                            )}
                            {open && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                onClick={() =>
                                  setPending({
                                    kind: "move_abort",
                                    title: `Abort ${m.name}?`,
                                    body: "Stops the move before the switch. The tenant stays where it is and is unfrozen.",
                                    confirm: "Abort move",
                                    danger: true,
                                    needsReason: true,
                                    reasonOptional: true,
                                    payload: { move_job: m.name },
                                  })
                                }
                              >
                                <RiCloseCircleLine className="mr-1.5 h-4 w-4" />{" "}
                                Abort
                              </Button>
                            )}
                            {canRollback && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                onClick={() =>
                                  setPending({
                                    kind: "move_rollback",
                                    title: `Roll back ${m.name}?`,
                                    body: `Moves ${m.subscription} back to ${m.from_docker}. The new site on ${m.to_docker} goes read-only, its changes since the switch are exported for replay, then the old site takes the tenant back and is writable again. The tenant is told.`,
                                    confirm: "Roll back",
                                    danger: true,
                                    needsReason: true,
                                    payload: { move_job: m.name },
                                  })
                                }
                              >
                                <RiArrowGoBackLine className="mr-1.5 h-4 w-4" />{" "}
                                Rollback
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <ConfirmDialog
        pending={pending}
        onClose={() => setPending(null)}
        onDone={onDone}
      />
    </Card>
  );
}

/** Per-side ack status: acked revision against the link revision. */
function Side({
  docker,
  company,
  acked,
  revision,
  error,
  self,
}: {
  docker: string;
  company?: string;
  acked: number;
  revision: number;
  error?: string | null;
  self: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-medium">{company || "—"}</p>
      <p className="font-mono text-xs text-muted-foreground">
        {self ? "this docker" : docker} · r{acked}/{revision}
      </p>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function LinksCard({
  docker,
  links,
}: {
  docker: string;
  links: CompanyLinkRow[] | null;
}) {
  return (
    <Card data-tour="fleet-links" className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Company links</CardTitle>
        <CardDescription>
          Companies here joined to a company in another docker. Each side shows
          the link revision it has acked; the dockers request, consent and
          revoke links themselves.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {links === null ? (
          <Unread what="Company Link" />
        ) : links.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No links for this docker.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {links.map((l) => (
              <li key={l.name} className="space-y-2 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {l.name}
                    {l.ownership_kind ? ` · ${l.ownership_kind}` : ""}
                  </span>
                  <LinkStatePill state={l.state} />
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3">
                  <Side
                    docker={l.from_docker}
                    company={l.from_company}
                    acked={l.from_acked_revision ?? 0}
                    revision={l.revision ?? 0}
                    error={l.from_ack_error}
                    self={l.from_docker === docker}
                  />
                  <span className="pt-0.5 text-muted-foreground">→</span>
                  <Side
                    docker={l.to_docker}
                    company={l.to_company}
                    acked={l.to_acked_revision ?? 0}
                    revision={l.revision ?? 0}
                    error={l.to_ack_error}
                    self={l.to_docker === docker}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
