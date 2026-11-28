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

"use server";

import { auth } from "@/app/(auth)/auth";
import { SYSTEM_ROLES } from "@/app/lib/role_constants";
import { ErrorBoardService, type ErrorBoard } from "@/app/services/control/errors";

// Server actions for the hub error dashboard (app/handson/control/errors/page.tsx).
// Staff only here; the hub enforces System Manager on every cmd as well.

const EMPTY: ErrorBoard = { errors_24h: 0, bugs: 0, tenants_affected: 0, tenants_total: null, tenants_down: null, rows: [] };

async function isStaff() {
  const session = await auth();
  const roles: string[] = (session?.user as any)?.roles || [];
  return roles.some((r) => SYSTEM_ROLES.includes(r));
}

export async function getErrorBoard(): Promise<{ data: ErrorBoard; error?: string }> {
  if (!(await isStaff())) return { data: EMPTY, error: "The error dashboard is for platform staff only." };
  try {
    return { data: await ErrorBoardService.board() };
  } catch (e) {
    console.error("control:error_board failed", e);
    return { data: EMPTY, error: "Could not load the errors." };
  }
}

export async function markErrorSeen(fingerprint: string) {
  if (!(await isStaff())) return { success: false, error: "Not allowed." };
  try {
    await ErrorBoardService.markSeen(fingerprint);
    return { success: true };
  } catch (e) {
    console.error("control:error_mark_seen failed", e);
    return { success: false, error: "Could not mark it seen." };
  }
}
