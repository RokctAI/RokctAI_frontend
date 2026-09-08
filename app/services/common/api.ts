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

import { platformCall } from "@/app/services/base/platform-gateway";

export interface PublicApiOptions {
  /** Abort after this many milliseconds. Default 10000. */
  timeout?: number;
  /** Extra request headers (e.g. `X-Rokct-Debug`). */
  headers?: Record<string, string>;
  /** Next.js fetch cache hints. Default `{ revalidate: 60 }`. */
  next?: { revalidate?: number | false; tags?: string[] };
}

/**
 * Guest read against the control plane (`ROKCT_BASE_URL`) through the ONE
 * platform gateway — `/api/v1/method/rokct.platform.api` with a `cmd` —
 * never a per-method `/api/method/<dotted.name>` URL (fleet rule; see
 * app/services/base/platform-gateway.ts). `cmd` is a control gateway key
 * (`control:<name>`, the control gateway serves only those). The call goes
 * out as a GET so Next.js fetch caching (`next.revalidate`) applies exactly
 * as the old per-method fetch did; the gateway accepts both verbs.
 *
 * This is a server action so the client-rendered status page can use it
 * (the gateway helper and `ROKCT_BASE_URL` are server-only). Returns the
 * unwrapped `message`, or `null` on any failure — the historical contract.
 */
export async function callPublicApi(
  cmd: string,
  params: Record<string, any> = {},
  options: PublicApiOptions = {},
) {
  const baseUrl = process.env.ROKCT_BASE_URL;
  if (!baseUrl) return null;

  const { timeout = 10000, headers, next = { revalidate: 60 } } = options;

  return platformCall<any>(
    cmd,
    Object.keys(params).length > 0 ? params : undefined,
    {
      baseUrl,
      method: "GET",
      requireAuth: false,
      timeout,
      headers,
      fetchOptions: { next },
    },
  );
}
