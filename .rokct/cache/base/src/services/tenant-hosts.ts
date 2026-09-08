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
 * Tenant-site resolution helpers for the platform gateway (ADR-005).
 *
 * One Next.js instance serves any number of tenants, so the backend a
 * request talks to is never pinned at build time. This module holds the
 * pure, request-agnostic pieces of that resolution — the Dart analogue is
 * `AppConstants.baseUrl` plus the site-name normalisation the paas shell's
 * `getPaaSClient` performed:
 *
 *  - [normalizeSiteUrl]: a tenant site name (`tenant-a.rokct.ai`) or a
 *    full origin becomes an origin (`https://tenant-a.rokct.ai`).
 *  - [lookupTenantHost]: maps the host name a request arrived on to the
 *    tenant site that serves it — first through the `ROKCT_TENANT_HOSTS`
 *    env map, then through a resolver registered with
 *    [setTenantHostResolver] (the hook for a control-site lookup later).
 *  - [envBaseUrl]: the build-time/default backend, the last fallback.
 *
 * The request-scoped orchestration (session, headers) lives in
 * platform-gateway.ts's `resolveTenantBaseUrl`.
 */

// Module-scoped so this file typechecks with or without @types/node; the
// `process.env.*` expressions are kept verbatim for Next.js inlining.
declare const process: { env: Record<string, string | undefined> };

/**
 * Turns a tenant site name or origin into an origin the gateway can be
 * reached at. Names carrying a scheme are kept as-is; `localhost` /
 * `127.0.0.1` names get `http://`, everything else `https://`. A trailing
 * slash is dropped so `${baseUrl}${PLATFORM_GATEWAY_PATH}` stays well
 * formed. Empty input resolves to `undefined`.
 */
export function normalizeSiteUrl(site?: string | null): string | undefined {
  const name = (site ?? '').trim();
  if (!name) return undefined;
  let url = name;
  if (!/^https?:\/\//i.test(name)) {
    const local = /(^|\.)(localhost|127\.0\.0\.1)(:\d+)?$/i.test(name);
    url = `${local ? 'http' : 'https'}://${name}`;
  }
  return url.replace(/\/+$/, '');
}

/**
 * Whether two site names/origins denote the same site once normalised
 * (scheme added, trailing slash dropped, case-folded). `false` when either
 * side is empty.
 */
export function sameSite(a?: string | null, b?: string | null): boolean {
  const left = normalizeSiteUrl(a)?.toLowerCase();
  const right = normalizeSiteUrl(b)?.toLowerCase();
  return Boolean(left && right && left === right);
}

/**
 * The configured default backend: `ROKCT_BASE_URL` (server-side), then
 * `NEXT_PUBLIC_ROKCT_BASE_URL` (also inlined client-side), then
 * `NEXT_PUBLIC_FRAPPE_URL` — the name the paas-era shell's `paas-gateway`
 * and `getFrappeClient` read, kept as a secondary alias so existing
 * deployments keep resolving. `undefined` when none is set.
 */
export function envBaseUrl(): string | undefined {
  try {
    return normalizeSiteUrl(
      process.env.ROKCT_BASE_URL ??
        process.env.NEXT_PUBLIC_ROKCT_BASE_URL ??
        process.env.NEXT_PUBLIC_FRAPPE_URL,
    );
  } catch {
    return undefined; // no `process` at all
  }
}

/**
 * A request-host to tenant-site resolver. Receives the host name the
 * request arrived on (lower-cased, port stripped) and returns the tenant
 * site name or origin that serves it, or `undefined` when unknown. May be
 * async (a control-site lookup, a cache).
 */
export type TenantHostResolver = (
  host: string,
) => string | undefined | Promise<string | undefined>;

let hostResolver: TenantHostResolver | undefined;

/**
 * Registers the hook consulted by [lookupTenantHost] after the
 * `ROKCT_TENANT_HOSTS` map — the seam for resolving custom domains
 * against the control site (`control:` cmd) later, without touching the
 * gateway. Register once from a server module the app is sure to load
 * (instrumentation.ts is the natural place). Pass `undefined` to clear.
 */
export function setTenantHostResolver(
  resolver: TenantHostResolver | undefined,
): void {
  hostResolver = resolver;
}

let parsedHostMap: Record<string, string> | null | undefined;

/**
 * The `ROKCT_TENANT_HOSTS` env map, parsed once: a JSON object keyed by
 * request host name (lower-case, optionally with port) whose values are
 * tenant site names or origins, e.g.
 * `{"shop.example.com": "tenant-a.rokct.ai", "localhost:3000": "http://tenant.localhost:8000"}`.
 * Malformed JSON is treated as an empty map (logged once).
 */
export function tenantHostMap(): Record<string, string> {
  if (parsedHostMap !== undefined) return parsedHostMap ?? {};
  let raw: string | undefined;
  try {
    raw = process.env.ROKCT_TENANT_HOSTS;
  } catch {
    raw = undefined;
  }
  if (!raw) {
    parsedHostMap = null;
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    const map: Record<string, string> = {};
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      for (const [host, site] of Object.entries(parsed as Record<string, unknown>)) {
        if (typeof site === 'string' && site.trim()) {
          map[host.trim().toLowerCase()] = site.trim();
        }
      }
    }
    parsedHostMap = map;
  } catch (e) {
    console.error('ROKCT_TENANT_HOSTS is not valid JSON; ignoring it', e);
    parsedHostMap = null;
  }
  return parsedHostMap ?? {};
}

/** Test/reload seam: forget the parsed `ROKCT_TENANT_HOSTS` map. */
export function resetTenantHostMap(): void {
  parsedHostMap = undefined;
}

/**
 * Whether a host lookup can succeed at all — i.e. `ROKCT_TENANT_HOSTS`
 * is set or a resolver is registered. `resolveTenantBaseUrl` only reads
 * the request headers when this is true, so single-tenant deployments
 * (env-configured backend) never opt a route into dynamic rendering just
 * to look at a header they do not use.
 */
export function hasTenantHostLookup(): boolean {
  if (hostResolver) return true;
  try {
    return Boolean(process.env.ROKCT_TENANT_HOSTS);
  } catch {
    return false;
  }
}

/**
 * Maps the host name a request arrived on to the origin of the tenant
 * site that serves it, or `undefined` when nothing matches. Tries the
 * exact host (as sent, e.g. `shop.example.com:3000`), then the host
 * without its port, against the env map, then hands the port-less host
 * to the registered resolver.
 */
export async function lookupTenantHost(
  host?: string | null,
): Promise<string | undefined> {
  const raw = (host ?? '').trim().toLowerCase();
  if (!raw) return undefined;
  const bare = raw.replace(/:\d+$/, '');
  const map = tenantHostMap();
  const mapped = map[raw] ?? map[bare];
  if (mapped) return normalizeSiteUrl(mapped);
  if (hostResolver) {
    try {
      return normalizeSiteUrl(await hostResolver(bare));
    } catch (e) {
      console.error(`Tenant host resolver failed for ${bare}`, e);
    }
  }
  return undefined;
}

/**
 * The host name from a request's headers: `x-forwarded-host` (the public
 * host when a proxy fronts the app) before `host`. Accepts anything with a
 * `Headers`-like `get` (a `Request`/`NextRequest` `headers`, the
 * `next/headers` result).
 */
export function hostFromHeaders(
  headers?: { get(name: string): string | null } | null,
): string | undefined {
  if (!headers) return undefined;
  const forwarded = headers.get('x-forwarded-host');
  const host = (forwarded ?? headers.get('host') ?? '').split(',')[0].trim();
  return host || undefined;
}
