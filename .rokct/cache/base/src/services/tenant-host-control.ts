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
 * The control-backed tenant host resolver (base_sdk 1.20.0): which tenant
 * site, if any, a request HOST belongs to.
 *
 * One deployment answers on any number of hosts. A tenant that points its
 * own domain at the shell (a `custom_domain` on its Company Subscription
 * at the control site) expects that host to open ITS portal, while every
 * other host - the platform's own domain, a preview, a local run, a
 * domain nobody claimed - keeps rendering the storefront. The control
 * site owns that mapping, so this module asks it:
 *
 *   POST {ROKCT_BASE_URL}/api/v1/method/{TENANT_HOST_RESOLVE_METHOD}
 *   { "host": "<request host>" }  ->  { "site_name": "<site>" } | null
 *
 * a guest call (`allow_guest`, no credentials ever sent) to the control
 * site's own whitelisted method by its dotted name, since the control
 * gateway resolves only registered `control:` keys and none names this
 * lookup. The answer is cached in memory - positive for
 * [TENANT_HOST_POSITIVE_TTL_MS], negative for [TENANT_HOST_NEGATIVE_TTL_MS]
 * - and concurrent lookups of one host share a single request.
 *
 * What is NEVER asked: a host that is not a public one (localhost, a
 * loopback or unspecified address, `.vercel.app`, `.local`, `.internal` -
 * [isPublicHost], base 1.19.0), the configured site's own host
 * (`NEXT_PUBLIC_SITE_URL`) and the control site's own host
 * (`ROKCT_BASE_URL`): each answers `null` with no network call. A host in
 * the `ROKCT_TENANT_HOSTS` env map answers from the map without a call
 * either, exactly as `lookupTenantHost` does, so a local run can point
 * `localhost:3000` at a tenant to see its portal.
 *
 * What is never thrown: a network error, a timeout, a non-2xx status or
 * a malformed answer all resolve to `null` (unknown host = storefront),
 * logged ONCE per process so a control outage does not flood the log.
 *
 * Runtime: this module imports only the pure kernel helpers and uses the
 * global `fetch`, so it runs in the edge runtime (middleware) and on the
 * server alike. [resolveTenantSiteForRequest] is the middleware entry;
 * [registerControlTenantHostResolver] plugs the same lookup into
 * `setTenantHostResolver`, which platform-gateway.ts does at load so
 * `resolveTenantBaseUrl` keeps resolving the backend per host.
 *
 * Environment (names; every one optional):
 *  - `ROKCT_BASE_URL` - the control site the lookup is sent to (the
 *    kernel's existing default backend; see envBaseUrl). Unset: no lookup.
 *  - `NEXT_PUBLIC_SITE_URL` - the shell's own host, never looked up.
 *  - `ROKCT_TENANT_HOSTS` - the JSON host map, consulted first.
 *  - `ROKCT_TENANT_HOST_LOOKUP` - `off` disables the control lookup
 *    entirely (the map still answers).
 *  - `ROKCT_TENANT_HOST_TTL_MS` - positive cache TTL, default 300000.
 *  - `ROKCT_TENANT_HOST_NEGATIVE_TTL_MS` - negative cache TTL, default 60000.
 *  - `ROKCT_TENANT_HOST_TIMEOUT_MS` - per-lookup timeout, default 3000.
 */

import { PLATFORM_METHOD_PATH } from './gateway-constants';
import { generateTraceId } from './telemetry';
import {
  envBaseUrl,
  isPublicHost,
  normaliseHost,
  normalizeSiteUrl,
  requestHost,
  sameSite,
  setTenantHostResolver,
  tenantHostMap,
  type HeaderReader,
} from './tenant-hosts';

// Module-scoped so this file typechecks with or without @types/node; the
// `process.env.*` expressions are kept verbatim for Next.js inlining.
declare const process: { env: Record<string, string | undefined> };

/**
 * The control site's whitelisted lookup, by dotted name: `host` in,
 * `{site_name}` or `null` out. Guest-accessible. The ONE place the name
 * lives.
 */
export const TENANT_HOST_RESOLVE_METHOD =
  'control.control.api.subscription.resolve_site_by_host';

/** How long a resolved host keeps its site without asking control again. */
export const TENANT_HOST_POSITIVE_TTL_MS = 5 * 60 * 1000;

/** How long an unknown host stays unknown without asking control again. */
export const TENANT_HOST_NEGATIVE_TTL_MS = 60 * 1000;

/** How long one lookup may take before it is abandoned as unknown. */
export const TENANT_HOST_TIMEOUT_MS = 3000;

/** The request header auth_sdk's middleware forwards a resolved site on. */
export const TENANT_SITE_HEADER = 'x-rokct-tenant-site';

/**
 * A site name as the control site returns it: a host name with at least
 * one dot, letters, digits and hyphens only. Anything else (a path, a
 * scheme, an empty string, an object) is treated as no site.
 */
const SITE_NAME_RE =
  /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

/** The `fetch` the lookup goes out on: the global one, or a test seam. */
export type TenantHostFetch = (
  url: string,
  init: RequestInit,
) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

interface CacheEntry {
  site: string | null;
  expires: number;
}

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<string | null>>();
let fetchImpl: TenantHostFetch | undefined;
let loggedFailure = false;

function envNumber(name: string, fallback: number): number {
  let raw: string | undefined;
  try {
    raw = process.env[name];
  } catch {
    raw = undefined;
  }
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function envString(name: string): string | undefined {
  try {
    return process.env[name];
  } catch {
    return undefined;
  }
}

/** The positive TTL: `ROKCT_TENANT_HOST_TTL_MS`, else the constant. */
export function tenantHostPositiveTtlMs(): number {
  return envNumber('ROKCT_TENANT_HOST_TTL_MS', TENANT_HOST_POSITIVE_TTL_MS);
}

/** The negative TTL: `ROKCT_TENANT_HOST_NEGATIVE_TTL_MS`, else the constant. */
export function tenantHostNegativeTtlMs(): number {
  return envNumber(
    'ROKCT_TENANT_HOST_NEGATIVE_TTL_MS',
    TENANT_HOST_NEGATIVE_TTL_MS,
  );
}

/** The lookup timeout: `ROKCT_TENANT_HOST_TIMEOUT_MS`, else the constant. */
export function tenantHostTimeoutMs(): number {
  return envNumber('ROKCT_TENANT_HOST_TIMEOUT_MS', TENANT_HOST_TIMEOUT_MS);
}

/** Whether `ROKCT_TENANT_HOST_LOOKUP=off` has switched the control lookup off. */
export function tenantHostLookupEnabled(): boolean {
  const raw = (envString('ROKCT_TENANT_HOST_LOOKUP') ?? '').trim().toLowerCase();
  return raw !== 'off' && raw !== 'false' && raw !== '0';
}

/**
 * The control site the lookup is sent to: `ROKCT_BASE_URL` through the
 * kernel's [envBaseUrl] (so its aliases apply), or `undefined` when none
 * is configured - in which case nothing is ever looked up.
 */
export function controlBaseUrl(): string | undefined {
  return envBaseUrl();
}

/** The normalised host of an origin, or null when it is not a URL. */
function hostOfUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return normaliseHost(new URL(url).host);
  } catch {
    return null;
  }
}

/**
 * The hosts that are this deployment's OWN and never a tenant's: the
 * configured site url's (`NEXT_PUBLIC_SITE_URL`) and the control
 * site's. Each is `null` when not configured.
 */
export function ownHosts(): { site: string | null; control: string | null } {
  return {
    site: hostOfUrl(envString('NEXT_PUBLIC_SITE_URL')?.trim() || undefined),
    control: hostOfUrl(controlBaseUrl()),
  };
}

/**
 * A site name as auth_sdk needs it (`https://${site_name}`): a bare host,
 * from a name or an origin. Null when it is not a usable name, or when
 * it is the control site itself - a resolved "tenant" that is control
 * would open a portal against the control plane, which must never happen.
 */
function usableSiteName(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const origin = normalizeSiteUrl(value);
  if (!origin) return null;
  const host = hostOfUrl(origin);
  if (!host || !SITE_NAME_RE.test(host)) return null;
  const control = controlBaseUrl();
  if (control && sameSite(origin, control)) return null;
  return host;
}

/** Test seam: route lookups through this `fetch` (`undefined` = the global one). */
export function setTenantHostFetch(impl: TenantHostFetch | undefined): void {
  fetchImpl = impl;
}

/** Test/reload seam: forget every cached answer and the once-logged failure. */
export function resetTenantHostCache(): void {
  cache.clear();
  inflight.clear();
  loggedFailure = false;
}

/** The cached answer for a normalised host, or `undefined` when none is live. */
export function cachedTenantSite(host: string): string | null | undefined {
  const entry = cache.get(host);
  if (!entry) return undefined;
  if (entry.expires <= Date.now()) {
    cache.delete(host);
    return undefined;
  }
  return entry.site;
}

function remember(host: string, site: string | null): string | null {
  const ttl = site ? tenantHostPositiveTtlMs() : tenantHostNegativeTtlMs();
  if (ttl > 0) cache.set(host, { site, expires: Date.now() + ttl });
  return site;
}

function logFailureOnce(host: string, detail: unknown): void {
  if (loggedFailure) return;
  loggedFailure = true;
  console.error(
    `[tenant-host-control] ${TENANT_HOST_RESOLVE_METHOD} failed for ${host}; ` +
      'treating this and later unknown hosts as the storefront until it answers again',
    detail,
  );
}

/** The `{site_name}` answer, unwrapped from Frappe's `message` envelope. */
function siteNameOf(data: unknown): unknown {
  const body =
    data && typeof data === 'object' && 'message' in data
      ? (data as { message: unknown }).message
      : data;
  if (!body || typeof body !== 'object') return null;
  return (body as { site_name?: unknown }).site_name ?? null;
}

async function askControl(host: string): Promise<string | null> {
  const control = controlBaseUrl();
  if (!control) return null;
  const doFetch: TenantHostFetch =
    fetchImpl ?? (globalThis.fetch as unknown as TenantHostFetch);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), tenantHostTimeoutMs());
  try {
    const res = await doFetch(
      `${control}${PLATFORM_METHOD_PATH}/${TENANT_HOST_RESOLVE_METHOD}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          // ADR-006: every platform call carries the shared trace-id format.
          'x-trace-id': generateTraceId(),
        },
        body: JSON.stringify({ host }),
        signal: controller.signal,
        cache: 'no-store',
      },
    );
    if (!res.ok) {
      logFailureOnce(host, `HTTP ${res.status}`);
      return null;
    }
    return usableSiteName(siteNameOf(await res.json()));
  } catch (e) {
    logFailureOnce(host, e);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * The tenant site a request host belongs to, or `null` when it is not a
 * tenant's host: the `ROKCT_TENANT_HOSTS` map first (exact host, then
 * without its port), then - for a PUBLIC host that is neither the
 * configured site's nor the control site's - the cached or fresh answer
 * from the control site. Never throws.
 */
export async function resolveTenantSiteByHost(
  host: string | null | undefined,
): Promise<string | null> {
  const raw = (host ?? '').trim().toLowerCase();
  if (!raw) return null;

  const map = tenantHostMap();
  const bare = raw.replace(/:\d+$/, '');
  const mapped = map[raw] ?? map[bare];
  if (mapped) return usableSiteName(mapped) ?? null;

  const name = normaliseHost(raw);
  if (!isPublicHost(name)) return null;
  const own = ownHosts();
  if (name === own.site || name === own.control) return null;
  if (!tenantHostLookupEnabled() || !controlBaseUrl()) return null;

  const cached = cachedTenantSite(name);
  if (cached !== undefined) return cached;

  const pending = inflight.get(name);
  if (pending) return pending;
  const lookup = askControl(name)
    .then((site) => remember(name, site))
    .finally(() => inflight.delete(name));
  inflight.set(name, lookup);
  return lookup;
}

/**
 * The tenant site the request is for, from its headers -
 * `x-forwarded-host` (first value) else `host`, port and `www.` stripped,
 * lower-cased (base 1.19.0's [requestHost]) - or `null` for the
 * storefront. The middleware entry point; edge-safe. Never throws.
 */
export async function resolveTenantSiteForRequest(
  headers: HeaderReader | null | undefined,
): Promise<string | null> {
  const host = requestHost(headers);
  if (!host) return null;
  try {
    return await resolveTenantSiteByHost(host);
  } catch (e) {
    logFailureOnce(host, e);
    return null;
  }
}

/**
 * The resolver shape `setTenantHostResolver` takes, over
 * [resolveTenantSiteByHost]: `lookupTenantHost` hands it the bare host
 * and turns the site name into an origin itself.
 */
export async function controlTenantHostResolver(
  host: string,
): Promise<string | undefined> {
  return (await resolveTenantSiteByHost(host)) ?? undefined;
}

let registered = false;

/**
 * Plugs the control lookup into the kernel's per-request tenant
 * resolution (`resolveTenantBaseUrl` -> `lookupTenantHost`). Called by
 * platform-gateway.ts at load, so every deployment with a control site
 * resolves custom domains with no host wiring; idempotent. A host that
 * registers its own resolver with `setTenantHostResolver` afterwards
 * replaces it, as before. Returns whether the resolver is now registered.
 */
export function registerControlTenantHostResolver(): boolean {
  if (registered) return true;
  if (!tenantHostLookupEnabled() || !controlBaseUrl()) return false;
  setTenantHostResolver(controlTenantHostResolver);
  registered = true;
  return true;
}

/** Test seam: forget that the resolver was registered (does not unregister it). */
export function resetControlTenantHostResolver(): void {
  registered = false;
}
