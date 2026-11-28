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

import { ControlBaseService } from "@/app/services/control/base";

// The hub's error dashboard (Ray 2026-11-22: hub only, tenants never see it,
// it would expose our source). Every tenant's backend errors, sent hourly,
// plus the hub's own: where it happened (file : function : line), how often,
// which version. Cleaned at the source: no secrets, customers by ID only.
// Cmds (System Manager only): control:error_board, control:error_mark_seen
// (control fleet/pulsar/cmds_ported.py -> core pulsar.error_dashboard).
// Caller: app/actions/handson/control/errors/errors.ts.

export interface ErrorFrame {
  file: string;
  function: string;
  line: number;
}

export interface ErrorBug {
  fingerprint: string;
  where: string;
  error: string;
  tenants: number;
  times: number;
  last_seen: string;
  seen: boolean;
  version: string | null;
  commit: string | null;
  request_id: string | null;
  path: string | null;
  frames: ErrorFrame[];
  reference: [string, string] | null;
}

export interface ErrorBoard {
  errors_24h: number;
  bugs: number;
  tenants_affected: number;
  tenants_total: number | null;
  tenants_down: number | null;
  rows: ErrorBug[];
}

function unwrap<T>(response: any): T {
  return (response?.message ?? response) as T;
}

export class ErrorBoardService {
  static async board(): Promise<ErrorBoard> {
    const res = unwrap<ErrorBoard>(await ControlBaseService.call("control:error_board", {}));
    if (!res || !Array.isArray(res.rows)) throw new Error("control:error_board returned no rows");
    return res;
  }

  static async markSeen(fingerprint: string): Promise<void> {
    await ControlBaseService.call("control:error_mark_seen", { fingerprint });
  }
}
