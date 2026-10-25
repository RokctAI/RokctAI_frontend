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
  DockerDetail,
  DockerRow,
  PlacementRow,
  SettingsRevisionRow,
  UsageSample,
} from "./types";

/**
 * Demo fixtures for the fleet board. Used by the guided tour build and by
 * any environment that sets ROKCT_DEMO_DATA=1, and as the fallback preview
 * when the hub has no Docker Instance doctype yet. Times are relative to
 * "now" so the health colours stay meaningful whenever the tour runs: one
 * green shared ERP docker, one amber, one red, one stopped, one applying.
 */

const iso = (minsAgo: number, now: number) =>
  new Date(now - minsAgo * 60_000).toISOString();

export function demoDockers(now: number = Date.now()): DockerRow[] {
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
  "Active",
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
      d.state === "Stopped"
        ? "Stopped"
        : n === 1
          ? "Active"
          : LIFECYCLE[i % LIFECYCLE.length];
    return {
      name: `SUB-${d.docker_id}-${i + 1}`,
      company,
      site_name: `${company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.rokct.ai`,
      plan: d.hosting_tier === "Shared" ? "ERP Starter" : "ERP Dedicated",
      status: lifecycle === "Active" ? "Active" : "Past Due",
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
  };
}

/**
 * True when `id` is a fixture docker name or fixture subscription id. Used by
 * runFleetAction to refuse fixture ids outside ROKCT_DEMO_DATA mode, so a page
 * showing fallback fixtures can never send real hub cmds for them.
 */
export function isFixtureId(id: unknown): boolean {
  if (typeof id !== "string" || !id) return false;
  const names = demoDockers(0).map((d) => d.docker_id);
  if (names.includes(id)) return true;
  return names.some((n) => new RegExp(`^SUB-${n}-\\d+$`).test(id));
}
