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

/**
 * Shared fleet board types and pure helpers (no server or client imports),
 * used by the server actions, the demo fixtures and both board pages.
 */

export type Health = "green" | "amber" | "red" | "unknown";

export interface DockerRow {
  name: string;
  docker_id: string;
  docker_type: string;
  server: string;
  ownership?: string;
  hosting_tier?: string;
  state: string;
  state_since?: string;
  app_version?: string;
  lock_sha?: string;
  template?: string;
  settings_revision_desired?: number;
  settings_revision_applied?: number;
  last_heartbeat_at?: string | null;
  heartbeat_status?: string;
  site_count?: number;
  tenant_count?: number;
}

export interface UsageSample {
  date: string;
  users_active?: number;
  users_total?: number;
  storage_gb?: number;
  db_size_gb?: number;
  requests?: number;
  background_jobs?: number;
  cpu_seconds?: number;
  errors?: number;
}

export interface SettingsRevisionRow {
  name: string;
  revision: number;
  created_at?: string;
  created_by?: string;
  applied_at?: string | null;
  apply_result?: string | null;
  diff?: string | null;
}

export interface PlacementRow {
  name: string;
  company: string;
  site_name?: string;
  plan?: string;
  status?: string;
  lifecycle_state?: string | null;
  state_entered_at?: string | null;
  next_transition_at?: string | null;
}

export interface DockerDetail {
  docker: DockerRow;
  usage: UsageSample[];
  revisions: SettingsRevisionRow[];
  placements: PlacementRow[];
}

export interface FleetResult<T> {
  data: T;
  demo: boolean;
  /** Set when the fleet cmd errored and demo data is shown instead. */
  notice?: string;
}

/** Beat interval the docker job runs at (spec 5: once a minute). */
export const BEAT_SECONDS = 60;

/**
 * Health from the last beat, per spec 7.5: green within 3 intervals, amber
 * 3 to 10 missed, red beyond 10. A hub-reported red (failing health check)
 * wins over a fresh beat. Stopped, Archived and Removed dockers do not beat,
 * so they read as "unknown" rather than alarming red.
 */
export function deriveHealth(d: DockerRow, now: number = Date.now()): Health {
  if (["Stopped", "Archived", "Removed"].includes(d.state)) return "unknown";
  if (d.heartbeat_status === "red") return "red";
  if (!d.last_heartbeat_at)
    return d.state === "Provisioning" ? "unknown" : "red";
  const ts = new Date(d.last_heartbeat_at.replace(" ", "T")).getTime();
  if (Number.isNaN(ts)) return "unknown";
  const missed = (now - ts) / 1000 / BEAT_SECONDS;
  if (missed <= 3) return "green";
  if (missed <= 10) return "amber";
  return "red";
}

export type RevisionSync = "in_sync" | "pending" | "behind" | "none";

/** Applied lagging desired by one is a normal in-flight apply; more is behind. */
export function revisionSync(d: DockerRow): RevisionSync {
  const want = d.settings_revision_desired ?? 0;
  const have = d.settings_revision_applied ?? 0;
  if (!want) return "none";
  if (have >= want) return "in_sync";
  return want - have === 1 ? "pending" : "behind";
}

export function parseFrappeDate(v?: string | null): Date | null {
  if (!v) return null;
  const d = new Date(v.replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d;
}
