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
// The tenant-host switch, the pure half (auth_sdk 1.7.0).
//
// One deployment answers on any number of hosts. When base_sdk's control
// lookup (app/services/base/tenant-host-control.ts,
// resolveTenantSiteForRequest) says the host a request arrived on is a
// TENANT's own domain, that host is that tenant's portal: its root and its
// landing are its login, and there is nothing to register - the tenant
// already exists. When nothing resolves (the platform's own domain, a
// preview, a local run, a domain nobody claimed) every path is the
// storefront, exactly as before the switch existed.
//
// This module decides, from a pathname alone, what middleware.ts does with
// a request on a resolved tenant host. It imports nothing so it runs in the
// edge runtime and under a plain node test; the response assembly (rewrite,
// redirect, the forwarded header) stays in middleware.ts.

/** The route a tenant host's root, landing and register paths lead to. */
export const TENANT_LOGIN_PATH = "/login";

/**
 * The paths a tenant host REWRITES to the login (the URL the visitor sees
 * is unchanged): the root and the storefront's landing page. On a tenant
 * host neither has anything to show a visitor but the sign-in.
 */
export const TENANT_HOME_PATHS: readonly string[] = ["/", "/landing"];

/**
 * The paths a tenant host REDIRECTS to the login: every sign-up route this
 * SDK owns. A tenant's domain never offers registration - the account that
 * signs in here was provisioned when the tenant was.
 */
export const TENANT_REGISTER_PATHS: readonly string[] = ["/register"];

export type TenantHostDecision =
  | { kind: "rewrite"; to: string }
  | { kind: "redirect"; to: string }
  | { kind: "next" };

/** A pathname with its trailing slash dropped (`/landing/` is `/landing`), the root kept. */
export function normalisePathname(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed || "/";
}

/**
 * What a request on a RESOLVED tenant host does with this pathname:
 * `rewrite` to the login for the home paths, `redirect` to the login for
 * the register paths, `next` (the existing path/role logic, with the
 * tenant header forwarded) for everything else - including the login
 * itself, which then reads the header.
 */
export function tenantHostDecision(pathname: string): TenantHostDecision {
  const path = normalisePathname(pathname);
  if (TENANT_HOME_PATHS.includes(path)) {
    return { kind: "rewrite", to: TENANT_LOGIN_PATH };
  }
  if (
    TENANT_REGISTER_PATHS.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`),
    )
  ) {
    return { kind: "redirect", to: TENANT_LOGIN_PATH };
  }
  return { kind: "next" };
}

/**
 * Whether an upstream middleware answer is a plain pass-through (Next's
 * `NextResponse.next()`, which NextAuth returns when the path is allowed)
 * rather than a redirect or rewrite of its own: pass-throughs are rebuilt
 * with the tenant header forwarded, anything else is returned as it is.
 */
export function isPassThrough(response: {
  status: number;
  headers: { get(name: string): string | null };
}): boolean {
  return (
    response.status >= 200 &&
    response.status < 300 &&
    response.headers.get("x-middleware-next") === "1" &&
    !response.headers.get("x-middleware-rewrite")
  );
}

/**
 * The first value of a query parameter as Next hands `searchParams` to a
 * page (a string, an array when repeated, or nothing), trimmed; null when
 * empty.
 */
export function firstParam(
  value: string | string[] | undefined | null,
): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = (raw ?? "").trim();
  return trimmed || null;
}

/**
 * The tenant site for a login or a page: the `site_name` query parameter
 * when present (it always wins - an explicit link to a portal), else the
 * header middleware.ts forwarded for a resolved tenant host, else null
 * (the storefront's own login).
 */
export function resolveTenantSite(
  fromQuery: string | string[] | undefined | null,
  fromHeader: string | null | undefined,
): string | null {
  return firstParam(fromQuery) ?? ((fromHeader ?? "").trim() || null);
}
