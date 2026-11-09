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

import type {
  CompanyLinkRow,
  DockerDetail,
  DockerRow,
  FleetBoard,
  MoveJobRow,
  PlacementRow,
  ServerAgentRow,
  ServerSummary,
  SettingsRevisionRow,
  UsageSample,
} from "./types";
import { deriveHealth } from "./types";

/**
 * Demo fixtures for the fleet board. Used by the guided tour build and by
 * any environment that sets ROKCT_DEMO_DATA=1, and as the fallback preview
 * when the hub has no Docker Instance doctype yet. Times are relative to
 * "now" so the health colours stay meaningful whenever the tour runs: one
 * green shared ERP docker (with drift and an Archived tenant), one amber, one
 * red (with its alert and a failed outside probe), one stopped, one archived,
 * one applying. Server agents, company links and move jobs are fixtures too.
 */

const iso = (minsAgo: number, now: number) =>
  new Date(now - minsAgo * 60_000).toISOString();

const NO_ALERT = {
  drift: false,
  drift_sites: [] as string[],
  red_alert_at: null,
  last_probe_at: null,
  last_probe_status: null,
  last_probe_ok: false,
};

export function demoDockers(now: number = Date.now()): DockerRow[] {
  return baseDockers(now).map((d) => ({ ...NO_ALERT, ...d }));
}

function baseDockers(now: number): DockerRow[] {
  return [
    {
      name: "hub-k3x9",
      docker_id: "hub-k3x9",
      docker_type: "hub",
      server: "jnb-core-01",
      ownership: "Own",
      hosting_tier: "Dedicated",
      state: "Running",
      state_since: iso(60 * 24 * 41, now),
      app_version: "rcore 4.12.0",
      lock_sha: "9f2c1ab",
      template: "rokctapp.json",
      settings_revision_desired: 18,
      settings_revision_applied: 18,
      last_heartbeat_at: iso(0.4, now),
      site_count: 1,
      tenant_count: 0,
    },
    {
      name: "tenant-a71q",
      docker_id: "tenant-a71q",
      docker_type: "tenant",
      server: "jnb-core-01",
      ownership: "Own",
      hosting_tier: "Shared",
      state: "Running",
      state_since: iso(60 * 24 * 19, now),
      app_version: "rcore 4.12.0",
      lock_sha: "9f2c1ab",
      template: "tenant_erp.json",
      settings_revision_desired: 42,
      settings_revision_applied: 41,
      last_heartbeat_at: iso(1.2, now),
      site_count: 6,
      tenant_count: 6,
      drift: true,
      drift_sites: ["old-pilot.rokct.ai"],
    },
    {
      name: "polaris-7m2d",
      docker_id: "polaris-7m2d",
      docker_type: "polaris",
      server: "jnb-edge-02",
      ownership: "Customer",
      hosting_tier: "Dedicated",
      state: "Running",
      state_since: iso(60 * 24 * 7, now),
      app_version: "rcore 4.11.3",
      lock_sha: "c41e07d",
      template: "polaris.json",
      settings_revision_desired: 9,
      settings_revision_applied: 9,
      last_heartbeat_at: iso(6, now),
      site_count: 1,
      tenant_count: 1,
    },
    {
      name: "supacharge-q8vn",
      docker_id: "supacharge-q8vn",
      docker_type: "supacharge",
      server: "cpt-edge-01",
      ownership: "Own",
      hosting_tier: "Dedicated",
      state: "Running",
      state_since: iso(60 * 24 * 2, now),
      app_version: "rcore 4.12.0",
      lock_sha: "9f2c1ab",
      template: "supacharge.json",
      settings_revision_desired: 14,
      settings_revision_applied: 11,
      last_heartbeat_at: iso(27, now),
      site_count: 1,
      tenant_count: 1,
      red_alert_at: iso(16, now),
      last_probe_at: iso(15, now),
      last_probe_status: "http_502",
      last_probe_ok: false,
    },
    {
      name: "deliveryplatform-2hr5",
      docker_id: "deliveryplatform-2hr5",
      docker_type: "deliveryplatform",
      server: "cpt-edge-01",
      ownership: "Own",
      hosting_tier: "Dedicated",
      state: "Running",
      state_since: iso(60 * 24 * 63, now),
      app_version: "rcore 4.12.0",
      lock_sha: "9f2c1ab",
      template: "deliveryplatform.json",
      settings_revision_desired: 31,
      settings_revision_applied: 31,
      last_heartbeat_at: iso(0.8, now),
      site_count: 1,
      tenant_count: 1,
    },
    {
      name: "tenant-x04c",
      docker_id: "tenant-x04c",
      docker_type: "tenant",
      server: "jnb-edge-02",
      ownership: "Own",
      hosting_tier: "Dedicated",
      state: "Stopped",
      state_since: iso(60 * 24 * 12, now),
      app_version: "rcore 4.10.1",
      lock_sha: "5b8d2e0",
      template: "tenant_erp.json",
      settings_revision_desired: 6,
      settings_revision_applied: 6,
      last_heartbeat_at: iso(60 * 24 * 12, now),
      site_count: 1,
      tenant_count: 1,
    },
    {
      name: "tenant-r3p8",
      docker_id: "tenant-r3p8",
      docker_type: "tenant",
      server: "jnb-edge-02",
      ownership: "Own",
      hosting_tier: "Dedicated",
      state: "Archived",
      state_since: iso(60 * 24 * 40, now),
      app_version: "rcore 4.9.4",
      lock_sha: "1d7a9c3",
      template: "tenant_erp.json",
      settings_revision_desired: 4,
      settings_revision_applied: 4,
      last_heartbeat_at: iso(60 * 24 * 52, now),
      site_count: 1,
      tenant_count: 1,
    },
  ];
}

/** Board totals per server, as control:fleet_board returns them. */
export function demoServers(
  dockers: DockerRow[],
  now: number = Date.now(),
): ServerSummary[] {
  const out = new Map<string, ServerSummary>();
  dockers.forEach((d) => {
    const s = out.get(d.server) || {
      name: d.server,
      dockers_count: 0,
      sites_count: 0,
      red: 0,
      drift: 0,
    };
    s.dockers_count += 1;
    s.sites_count += d.site_count || 0;
    if (deriveHealth(d, now) === "red") s.red += 1;
    if (d.drift) s.drift += 1;
    out.set(d.server, s);
  });
  return [...out.values()];
}

export function demoBoard(now: number = Date.now()): FleetBoard {
  const dockers = demoDockers(now);
  return { dockers, servers: demoServers(dockers, now) };
}

export function demoServerAgents(now: number = Date.now()): ServerAgentRow[] {
  return [
    {
      name: "cpt-edge-01",
      server: "cpt-edge-01",
      agent_status: "green",
      last_beat_at: iso(0.6, now),
      agent_version: "0.4.0",
      enrolled_at: iso(60 * 24 * 30, now),
      key_rotated_at: iso(60 * 24 * 3, now),
    },
    {
      name: "jnb-core-01",
      server: "jnb-core-01",
      agent_status: "green",
      last_beat_at: iso(0.3, now),
      agent_version: "0.4.0",
      enrolled_at: iso(60 * 24 * 44, now),
      key_rotated_at: null,
    },
    {
      name: "jnb-edge-02",
      server: "jnb-edge-02",
      agent_status: "amber",
      last_beat_at: iso(7, now),
      agent_version: "0.3.1",
      enrolled_at: iso(60 * 24 * 21, now),
      key_rotated_at: null,
    },
  ];
}

function demoLinks(): CompanyLinkRow[] {
  return [
    {
      name: "LINK-DEMO-1",
      from_docker: "deliveryplatform-2hr5",
      from_company: "Deliveryplatform Demo Co",
      to_docker: "tenant-a71q",
      to_company: "Mzansi Fresh Foods",
      state: "active",
      ownership_kind: "customer",
      revision: 3,
      from_acked_revision: 3,
      to_acked_revision: 3,
    },
    {
      name: "LINK-DEMO-2",
      from_docker: "tenant-a71q",
      from_company: "Karoo Tech Works",
      to_docker: "polaris-7m2d",
      to_company: "Polaris Demo Co",
      state: "active",
      ownership_kind: "subsidiary",
      revision: 2,
      from_acked_revision: 2,
      to_acked_revision: 1,
      to_ack_error: "link_update r2: docker busy, will retry",
    },
    {
      name: "LINK-DEMO-3",
      from_docker: "supacharge-q8vn",
      from_company: "Supacharge Demo Co",
      to_docker: "tenant-a71q",
      to_company: "Umoya Solar",
      state: "requested",
      ownership_kind: "division",
      revision: 1,
      from_acked_revision: 1,
      to_acked_revision: 0,
    },
  ];
}

function demoMoves(now: number): MoveJobRow[] {
  return [
    {
      name: "MOVE-DEMO-1",
      subscription: "SUB-tenant-a71q-2",
      from_docker: "tenant-a71q",
      to_docker: "tenant-n2w6",
      state: "planned",
      quiet_hour_window: "01:00-03:00",
      not_before: new Date(now + 20 * 3_600_000).toISOString(),
      postponed: false,
      modified: iso(60 * 4, now),
    },
    {
      name: "MOVE-DEMO-3",
      subscription: "SUB-tenant-a71q-3",
      from_docker: "tenant-x04c",
      to_docker: "tenant-a71q",
      state: "switched",
      quiet_hour_window: "01:00-03:00",
      not_before: iso(60 * 26, now),
      postponed: false,
      switched_at: iso(60 * 22, now),
      red_kept_until: new Date(now + 6 * 86_400_000).toISOString(),
      modified: iso(60 * 22, now),
    },
    {
      name: "MOVE-DEMO-2",
      subscription: "SUB-tenant-a71q-4",
      from_docker: "tenant-x04c",
      to_docker: "tenant-a71q",
      state: "done",
      quiet_hour_window: "02:00-04:00",
      not_before: iso(60 * 24 * 9, now),
      postponed: true,
      modified: iso(60 * 24 * 9 - 50, now),
    },
  ];
}

function demoUsage(d: DockerRow, now: number): UsageSample[] {
  const sites = d.site_count || 1;
  const seed = d.docker_id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return Array.from({ length: 7 }, (_, i) => {
    const wobble = ((seed * (i + 3)) % 17) / 17;
    const day = new Date(now - i * 86_400_000);
    return {
      date: day.toISOString().slice(0, 10),
      users_active: Math.round(sites * (6 + wobble * 9)),
      users_total: sites * 18,
      storage_gb: +(sites * (3.2 + i * -0.04 + wobble * 0.3)).toFixed(2),
      db_size_gb: +(sites * (0.9 + wobble * 0.2)).toFixed(2),
      requests: Math.round(sites * (8400 + wobble * 5200)),
      background_jobs: Math.round(sites * (210 + wobble * 90)),
      cpu_seconds: Math.round(sites * (1900 + wobble * 1400)),
      errors:
        d.docker_type === "supacharge" && i < 2
          ? 37 - i * 11
          : Math.round(wobble * 3),
    };
  });
}

function demoRevisions(d: DockerRow, now: number): SettingsRevisionRow[] {
  const top = d.settings_revision_desired || 0;
  const applied = d.settings_revision_applied || 0;
  const diffs = [
    '{"limits": {"max_users": 25}}',
    '{"flags": {"beta_reports": true}}',
    '{"modules": {"+": ["hrms"]}}',
    '{"banner": "Scheduled maintenance Sunday 02:00"}',
    '{"hostnames": {"+": ["erp.example.co.za"]}}',
  ];
  return Array.from({ length: Math.min(5, top) }, (_, i) => {
    const rev = top - i;
    const done = rev <= applied;
    return {
      name: `${d.docker_id}-rev-${rev}`,
      revision: rev,
      created_at: iso(60 * (i * 30 + 4), now),
      created_by: i % 2 ? "ray@rokct.ai" : "Lifecycle Engine",
      applied_at: done ? iso(60 * (i * 30 + 4) - 2, now) : null,
      apply_result: done ? "applied" : null,
      diff: diffs[i % diffs.length],
    };
  });
}

const COMPANIES = [
  "Khanyisa Logistics",
  "Mzansi Fresh Foods",
  "Blue Crane Advisory",
  "Umoya Solar",
  "Karoo Tech Works",
  "Seaside Dental Group",
];
const LIFECYCLE = [
  "Active",
  "Active",
  "Lapsed",
  "Active",
  "ReadOnly",
  "Archived",
];

function demoPlacements(d: DockerRow, now: number): PlacementRow[] {
  if (d.docker_type === "hub") return [];
  const n = d.tenant_count || 1;
  return Array.from({ length: n }, (_, i) => {
    const company =
      n === 1
        ? `${d.docker_type[0].toUpperCase()}${d.docker_type.slice(1)} Demo Co`
        : COMPANIES[i % COMPANIES.length];
    const lifecycle =
      d.state === "Stopped" || d.state === "Archived"
        ? d.state
        : n === 1
          ? "Active"
          : LIFECYCLE[i % LIFECYCLE.length];
    const sub = `SUB-${d.docker_id}-${i + 1}`;
    return {
      name: sub,
      subscription: sub,
      company,
      site_name: `${company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.rokct.ai`,
      plan: d.hosting_tier === "Shared" ? "ERP Starter" : "ERP Dedicated",
      status:
        lifecycle === "Active"
          ? "Active"
          : lifecycle === "Archived"
            ? "Cancelled"
            : "Past Due",
      lifecycle_state: lifecycle,
      state_entered_at: iso(60 * 24 * (i + 2), now),
      next_transition_at:
        lifecycle === "Active"
          ? null
          : new Date(now + (i + 3) * 86_400_000).toISOString(),
    };
  });
}

export function demoDockerDetail(
  name: string,
  now: number = Date.now(),
): DockerDetail | null {
  const docker = demoDockers(now).find((d) => d.name === name);
  if (!docker) return null;
  return {
    docker,
    usage: demoUsage(docker, now),
    revisions: demoRevisions(docker, now),
    placements: demoPlacements(docker, now),
    links: demoLinks().filter(
      (l) => l.from_docker === name || l.to_docker === name,
    ),
    moves: demoMoves(now).filter(
      (m) => m.from_docker === name || m.to_docker === name,
    ),
  };
}

/**
 * True when `id` is a fixture docker, server, subscription, move job or link
 * id. Used by runFleetAction to refuse fixture ids outside ROKCT_DEMO_DATA
 * mode, so a page showing fallback fixtures can never send real hub cmds for
 * them.
 */
export function isFixtureId(id: unknown): boolean {
  if (typeof id !== "string" || !id) return false;
  const dockers = demoDockers(0);
  const names = dockers.map((d) => d.docker_id);
  if (names.includes(id)) return true;
  if (dockers.some((d) => d.server === id)) return true;
  if (/^(MOVE|LINK)-DEMO-\d+$/.test(id)) return true;
  return names.some((n) => new RegExp(`^SUB-${n}-\\d+$`).test(id));
}
