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

import "server-only";

import { auth as nextAuthSession } from "@/app/(auth)/auth";

// auth_sdk-installed session seam. The bare shell commits a neutral copy of
// this module whose functions always resolve to null (no auth surface, no
// sessions); composing auth_sdk overwrites it with this NextAuth-backed
// implementation. Shell gateway code (app/lib/client.ts, app/lib/roles.ts)
// and the base kernel's session reader (app/services/base/session.ts, which
// platform-gateway.ts's paasCall/platformCall go through) import ONLY this
// seam — never "@/app/(auth)/..." directly — so the shell builds identically
// with and without the auth surface installed.

/** The current NextAuth session, or null when unauthenticated. */
export async function auth(): Promise<any> {
  return nextAuthSession();
}

/** Alias kept for call sites that read as "session" rather than "auth". */
export async function getCurrentSession(): Promise<any> {
  return nextAuthSession();
}
