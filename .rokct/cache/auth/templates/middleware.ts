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
// The host shell's middleware, installed by auth_sdk (NextAuth-gated).
//
// Since 1.7.0 it carries the TENANT-HOST SWITCH in front of the path/role
// gate. base_sdk 1.20.0's resolveTenantSiteForRequest answers which tenant
// site, if any, the host a request arrived on belongs to (a custom domain
// a tenant pointed at this deployment, resolved at the control site and
// cached; never a non-public host, never the configured site's own host,
// never thrown - unknown means null). With NOTHING resolved the request is
// handed to NextAuth exactly as before: the storefront. With a site:
//
//   - the request goes on with `x-rokct-tenant-site: <site>` set, so the
//     login page and the login action know which portal they serve;
//   - the root and /landing are REWRITTEN to /login (the URL stays), which
//     renders the tenant portal login for that site;
//   - /register is REDIRECTED to /login: a tenant's domain offers no
//     sign-up;
//   - every other path keeps today's path/role logic, with the header.
//
// NextAuth's gate runs FIRST on every path, so a signed-in user on a
// tenant host still lands on their dashboard from /, and a signed-in
// visitor to /register is sent to / by the gate before the switch sees it.
// The switch only touches the gate's pass-through answers; its redirects
// stand. Edge-safe: base's resolver imports only the pure kernel helpers
// and the global fetch. See app/(auth)/tenant-host.ts for the decision.

import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import type { NextFetchEvent, NextMiddleware } from "next/server";

import { authConfig } from "@/app/(auth)/auth.config";
import {
  isPassThrough,
  tenantHostDecision,
} from "@/app/(auth)/tenant-host";
import {
  TENANT_SITE_HEADER,
  resolveTenantSiteForRequest,
} from "@/app/services/base/tenant-host-control";

// NextAuth's `auth` is typed for its Route Handler / Server Component
// callers; the (NextRequest, NextFetchEvent) middleware call it also
// serves has no overload of its own, so name it as the middleware it is
// here: its answer is a Response (or nothing) - never a Session.
const withAuth = NextAuth(authConfig).auth as unknown as NextMiddleware;

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  const site = await resolveTenantSiteForRequest(request.headers);
  if (!site) {
    // Unknown host, a preview, the configured site itself: the storefront,
    // gated exactly as before.
    return withAuth(request, event);
  }

  const headers = new Headers(request.headers);
  headers.set(TENANT_SITE_HEADER, site);
  const gated = await withAuth(
    new NextRequest(request, { headers }),
    event,
  );
  if (!gated || !isPassThrough(gated)) return gated;

  const decision = tenantHostDecision(request.nextUrl.pathname);
  let response: NextResponse;
  if (decision.kind === "redirect") {
    response = NextResponse.redirect(new URL(decision.to, request.nextUrl));
  } else if (decision.kind === "rewrite") {
    const url = request.nextUrl.clone();
    url.pathname = decision.to;
    response = NextResponse.rewrite(url, { request: { headers } });
  } else {
    response = NextResponse.next({ request: { headers } });
  }
  // Whatever the gate set on its pass-through (a refreshed session cookie)
  // travels on the answer that replaces it.
  for (const cookie of gated.headers.getSetCookie()) {
    response.headers.append("set-cookie", cookie);
  }
  return response;
}

export const config = {
  matcher: [
    "/",
    "/:id",
    "/api/:path*",
    "/login",
    "/register",
    "/handson/:path*",
  ],
};
