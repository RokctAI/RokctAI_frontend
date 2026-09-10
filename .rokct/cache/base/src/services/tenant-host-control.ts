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
 *   { "host": "<request host>" }
 *     ->  { "site_name": "<site>", "backend_url"?: "https://<backend>" } | null
 *
 * a guest call (`allow_guest`, no credentials ever sent) to the control
 * site's own whitelisted method by its dotted name, since the control
 * gateway resolves only registered `control:` keys and none names this
 * lookup. The answer is cached in memory - positive for
 * [TENANT_HOST_POSITIVE_TTL_MS], negative for [TENANT_HOST_NEGATIVE_TTL_MS]
 * - and concurrent lookups of one host share a single request.
 *
 * Since base_sdk 1.30.0 a tenant may also have a BACKEND custom domain
 * (Ray, 2026-09-10): besides the shell domain that opens its portal, a
 * domain of its own that its backend answers on, so the tenant keeps
 * working when the platform's own zone is down. Control returns it as
 * `backend_url` (a scheme'd origin) only while it is Active. The two
 * identities are kept apart:
 *
 *  - `site_name` stays the tenant's IDENTITY: [resolveTenantSiteByHost]
 *    and [resolveTenantSiteForRequest] answer it, so the
 *    `x-rokct-tenant-site` header auth_sdk's middleware forwards never
 *    carries the backend origin.
 *  - `backend_url` is WHERE the gateway talks to it: the registered
 *    [controlTenantHostResolver] answers the backend origin when control
 *    named one (else the site name, as before), and
 *    [alternateTenantOrigin] / [sameTenantOrigin] let platform-gateway.ts
 *    retry a failed call once on the other origin of the same pair and
 *    send the session's credentials to either - never to a third origin.
 *    A `backend_url` that is not a public host, is the control site, or
 *    is malformed is dropped (the site name still answers).
 *
 * Also since 1.30.0, stale-while-error: every positive answer is kept
 * for [TENANT_HOST_STALE_TTL_MS] (24 h) beyond the positive TTL, and
 * when control is UNREACHABLE (a network error, a timeout, a 5xx) the
 * last known answer for that host is served instead of "unknown host",
 * re-asked after the negative TTL. A definitive answer - control reached
 * and saying the host is nobody's, or a 4xx - replaces the stale one.
 * Protection, not persistence: the cache is per process, so an instance
 * that never saw a host while control was up still answers "storefront".
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
 *  - `ROKCT_TENANT_HOST_STALE_TTL_MS` - how long a positive answer is kept
 *    for stale-while-error, default 86400000; `0` switches it off.
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
 * `{site_name, backend_url?}` or `null` out. Guest-accessible. The ONE
 * place the name lives.
 */
export const TENANT_HOST_RESOLVE_METHOD =
  'control.control.api.subscription.resolve_site_by_host';

/** How long a resolved host keeps its site without asking control again. */
export const TENANT_HOST_POSITIVE_TTL_MS = 5 * 60 * 1000;

/** How long an unknown host stays unknown without asking control again. */
export const TENANT_HOST_NEGATIVE_TTL_MS = 60 * 1000;

/**
 * How long a resolved host's last answer is kept to serve while control
 * is unreachable (base_sdk 1.30.0, stale-while-error).
 */
export const TENANT_HOST_STALE_TTL_MS = 24 * 60 * 60 * 1000;

/** How long one lookup may take before it is abandoned as unknown. */
export const TENANT_HOST_TIMEOUT_MS = 3000;

/**
 * The request header auth_sdk's middleware forwards a resolved site on.
 * It carries the SITE NAME (the tenant's identity), never the backend
 * origin.
 */
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

/**
 * A resolved tenant host: the site name control answered (the tenant's
 * identity, what `x-rokct-tenant-site` carries) and, when the tenant has
 * an Active backend domain, the origin its backend answers on.
 */
export interface TenantHostSite {
  siteName: string;
  /** A scheme'd origin (`https://<backend host>`); absent when none is Active. */
  backendUrl?: string;
}

interface CacheEntry extends Omit<TenantHostSite, 'siteName'> {
  site: string | null;
  expires: number;
}

/** What one lookup came back with: an answer, or no way to know. */
type LookupOutcome =
  | { kind: 'answer'; site: TenantHostSite | null }
  | { kind: 'unreachable' };

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<TenantHostSite | null>>();
/** Last positive answer per host, kept for the stale TTL (stale-while-error). */
const stale = new Map<string, TenantHostSite & { expires: number }>();
/**
 * The other origin of every known pair, both ways: the site name's origin
 * to the backend origin and back, keyed by lower-cased origin. Kept for
 * the stale TTL so a retry still knows the pair while control is down.
 */
const alternates = new Map<string, { origin: string; expires: number }>();
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

/** The stale TTL: `ROKCT_TENANT_HOST_STALE_TTL_MS`, else the constant. */
export function tenantHostStaleTtlMs(): number {
  return envNumber('ROKCT_TENANT_HOST_STALE_TTL_MS', TENANT_HOST_STALE_TTL_MS);
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

/**
 * A backend origin as control returns it (`backend_url`): a scheme'd
 * http(s) origin whose host is a public site name and not the control
 * site's. Null (dropped, the site name still answers) for anything else.
 * The origin alone is kept - no path, no query.
 */
function usableBackendUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = normalizeSiteUrl(value);
  if (!normalized) return null;
  let url: URL;
  try {
    url = new URL(normalized);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  const host = normaliseHost(url.host);
  if (!isPublicHost(host) || !SITE_NAME_RE.test(host)) return null;
  const control = controlBaseUrl();
  if (control && sameSite(url.origin, control)) return null;
  return url.origin;
}

/** Test seam: route lookups through this `fetch` (`undefined` = the global one). */
export function setTenantHostFetch(impl: TenantHostFetch | undefined): void {
  fetchImpl = impl;
}

/**
 * Test/reload seam: forget every cached answer (live, stale and the
 * origin pairs) and the once-logged failure.
 */
export function resetTenantHostCache(): void {
  cache.clear();
  inflight.clear();
  stale.clear();
  alternates.clear();
  loggedFailure = false;
}

/**
 * The cached answer for a normalised host - the site and, when known,
 * its backend origin - `null` for a host cached as nobody's, or
 * `undefined` when nothing is live.
 */
export function cachedTenantHost(host: string): TenantHostSite | null | undefined {
  const entry = cache.get(host);
  if (!entry) return undefined;
  if (entry.expires <= Date.now()) {
    cache.delete(host);
    return undefined;
  }
  if (!entry.site) return null;
  return entry.backendUrl
    ? { siteName: entry.site, backendUrl: entry.backendUrl }
    : { siteName: entry.site };
}

/** The cached site name for a normalised host, or `undefined` when none is live. */
export function cachedTenantSite(host: string): string | null | undefined {
  const found = cachedTenantHost(host);
  return found === undefined ? undefined : (found?.siteName ?? null);
}

/** The last positive answer kept for a host, if its stale TTL has not run out. */
function staleTenantHost(host: string): TenantHostSite | undefined {
  const entry = stale.get(host);
  if (!entry) return undefined;
  if (entry.expires <= Date.now()) {
    stale.delete(host);
    return undefined;
  }
  return entry.backendUrl
    ? { siteName: entry.siteName, backendUrl: entry.backendUrl }
    : { siteName: entry.siteName };
}

function rememberPair(site: TenantHostSite, expires: number): void {
  if (!site.backendUrl) return;
  const own = normalizeSiteUrl(site.siteName) as string;
  alternates.set(own.toLowerCase(), { origin: site.backendUrl, expires });
  alternates.set(site.backendUrl.toLowerCase(), { origin: own, expires });
}

/**
 * The other origin of a known tenant pair - the backend origin of a site
 * name's origin, or the site name's origin of a backend origin - or
 * `undefined` when the origin is not one half of a pair this process has
 * resolved (within the stale TTL). Base 1.30.0: what platform-gateway.ts
 * retries a failed call on.
 */
export function alternateTenantOrigin(origin: string | null | undefined): string | undefined {
  const normalized = normalizeSiteUrl(origin)?.toLowerCase();
  if (!normalized) return undefined;
  const entry = alternates.get(normalized);
  if (!entry) return undefined;
  if (entry.expires <= Date.now()) {
    alternates.delete(normalized);
    return undefined;
  }
  return entry.origin;
}

/**
 * Whether two site names/origins denote the same TENANT: the same site
 * ([sameSite]), or the two halves of one known pair. The credential
 * guard platform-gateway.ts applies since 1.30.0 - a session's
 * credentials go to its site's origin or that site's backend origin,
 * never to a third.
 */
export function sameTenantOrigin(a?: string | null, b?: string | null): boolean {
  if (sameSite(a, b)) return true;
  const other = alternateTenantOrigin(a);
  return Boolean(other && sameSite(other, b));
}

function remember(host: string, site: TenantHostSite | null): TenantHostSite | null {
  const now = Date.now();
  const ttl = site ? tenantHostPositiveTtlMs() : tenantHostNegativeTtlMs();
  if (ttl > 0) {
    cache.set(host, {
      site: site?.siteName ?? null,
      ...(site?.backendUrl ? { backendUrl: site.backendUrl } : {}),
      expires: now + ttl,
    });
  }
  const staleTtl = tenantHostStaleTtlMs();
  if (site && staleTtl > 0) {
    stale.set(host, { ...site, expires: now + staleTtl });
    rememberPair(site, now + staleTtl);
  } else if (!site) {
    // Control reached and definite: the host is nobody's now.
    stale.delete(host);
  }
  return site;
}

/**
 * Control could not be reached: serve the host's last known answer, if
 * any, for the negative TTL (so control is asked again soon), else the
 * storefront for the same while.
 */
function rememberUnreachable(host: string): TenantHostSite | null {
  const known = staleTenantHost(host) ?? null;
  const ttl = tenantHostNegativeTtlMs();
  if (ttl > 0) {
    cache.set(host, {
      site: known?.siteName ?? null,
      ...(known?.backendUrl ? { backendUrl: known.backendUrl } : {}),
      expires: Date.now() + ttl,
    });
  }
  return known;
}

function logFailureOnce(host: string, detail: unknown): void {
  if (loggedFailure) return;
  loggedFailure = true;
  console.error(
    `[tenant-host-control] ${TENANT_HOST_RESOLVE_METHOD} failed for ${host}; ` +
      'serving each host its last known site while one is held, and the ' +
      'storefront otherwise, until it answers again',
    detail,
  );
}

/**
 * The `{site_name, backend_url?}` answer, unwrapped from Frappe's
 * `message` envelope, as a validated [TenantHostSite] - or null when
 * the site name is not usable. An unusable `backend_url` is dropped,
 * never fatal.
 */
function tenantHostSiteOf(data: unknown): TenantHostSite | null {
  const body =
    data && typeof data === 'object' && 'message' in data
      ? (data as { message: unknown }).message
      : data;
  if (!body || typeof body !== 'object') return null;
  const answer = body as { site_name?: unknown; backend_url?: unknown };
  const siteName = usableSiteName(answer.site_name ?? null);
  if (!siteName) return null;
  const backendUrl = usableBackendUrl(answer.backend_url ?? null);
  // A backend that is the site itself adds nothing: one origin, no pair.
  if (!backendUrl || sameSite(backendUrl, siteName)) return { siteName };
  return { siteName, backendUrl };
}

async function askControl(host: string): Promise<LookupOutcome> {
  const control = controlBaseUrl();
  if (!control) return { kind: 'answer', site: null };
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
      // A 5xx is control not answering; a 4xx is control answering "no".
      return res.status >= 500
        ? { kind: 'unreachable' }
        : { kind: 'answer', site: null };
    }
    return { kind: 'answer', site: tenantHostSiteOf(await res.json()) };
  } catch (e) {
    logFailureOnce(host, e);
    return { kind: 'unreachable' };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * The tenant a request host belongs to - its site name and, when control
 * named one, its backend origin - or `null` when it is not a tenant's
 * host: the `ROKCT_TENANT_HOSTS` map first (exact host, then without its
 * port; a map entry names no backend), then - for a PUBLIC host that is
 * neither the configured site's nor the control site's - the cached or
 * fresh answer from the control site, or the last known answer while
 * control is unreachable. Never throws.
 */
export async function resolveTenantHost(
  host: string | null | undefined,
): Promise<TenantHostSite | null> {
  const raw = (host ?? '').trim().toLowerCase();
  if (!raw) return null;

  const map = tenantHostMap();
  const bare = raw.replace(/:\d+$/, '');
  const mapped = map[raw] ?? map[bare];
  if (mapped) {
    const siteName = usableSiteName(mapped);
    return siteName ? { siteName } : null;
  }

  const name = normaliseHost(raw);
  if (!isPublicHost(name)) return null;
  const own = ownHosts();
  if (name === own.site || name === own.control) return null;
  if (!tenantHostLookupEnabled() || !controlBaseUrl()) return null;

  const cached = cachedTenantHost(name);
  if (cached !== undefined) return cached;

  const pending = inflight.get(name);
  if (pending) return pending;
  const lookup = askControl(name)
    .then((outcome) =>
      outcome.kind === 'answer'
        ? remember(name, outcome.site)
        : rememberUnreachable(name),
    )
    .finally(() => inflight.delete(name));
  inflight.set(name, lookup);
  return lookup;
}

/**
 * The tenant SITE NAME a request host belongs to, or `null` when it is
 * not a tenant's host - [resolveTenantHost]'s identity half, what the
 * `x-rokct-tenant-site` header carries. Never the backend origin.
 * Never throws.
 */
export async function resolveTenantSiteByHost(
  host: string | null | undefined,
): Promise<string | null> {
  return (await resolveTenantHost(host))?.siteName ?? null;
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
 * [resolveTenantHost]: `lookupTenantHost` hands it the bare host and
 * turns the answer into an origin itself. Since 1.30.0 the answer is the
 * tenant's backend origin when control named one (already scheme'd, so
 * `normalizeSiteUrl` keeps it), else the site name as before.
 */
export async function controlTenantHostResolver(
  host: string,
): Promise<string | undefined> {
  const found = await resolveTenantHost(host);
  if (!found) return undefined;
  return found.backendUrl ?? found.siteName;
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
