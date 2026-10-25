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

import type { NextRequest } from "next/server";

import { handlers } from "@/app/(auth)/auth";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const POST = handlers.POST;

/**
 * The backend credentials the session carries. Server code reads them from
 * auth() (base_sdk's gateway signs every call with them); the browser must
 * not. NextAuth's /session endpoint answers with the session callback's
 * output, which any page script can fetch, so the GET below strips these
 * fields from that one JSON answer. auth() itself is untouched.
 */
const CREDENTIAL_USER_FIELDS = ["apiKey", "apiSecret", "refreshToken"] as const;

export async function GET(req: NextRequest): Promise<Response> {
  const res = await handlers.GET(req);
  if (!new URL(req.url).pathname.endsWith("/session")) return res;

  const text = await res.text();
  // The body is decoded and re-serialised here, so the length and any
  // content-encoding of the original answer no longer describe it.
  const headers = new Headers(res.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    // Not JSON: hand back exactly what NextAuth answered.
    return new Response(text, { status: res.status, headers });
  }
  const user = (body as { user?: Record<string, unknown> } | null)?.user;
  if (user && typeof user === "object") {
    for (const field of CREDENTIAL_USER_FIELDS) delete user[field];
  }
  return new Response(JSON.stringify(body), { status: res.status, headers });
}
