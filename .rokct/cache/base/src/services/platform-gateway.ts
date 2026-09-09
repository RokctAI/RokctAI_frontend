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
 * Universal platform gateway client — the Next.js side of the shared
 * kernel (ADR-005), mirroring the Dart client at
 * base/dart/lib/src/handlers/platform_gateway.dart.
 *
 * ONE method name serves every backend: `rokct.platform.api` is registered
 * app-side (rCore hooks) as `rcore.platform.api.execute`, which routes by
 * the site's role (tenant/control) server-side — so which backend answers
 * and which flow runs is decided purely by the base URL the client points
 * at. `cmd` semantics:
 *
 *  - tenant sites:  prefix-free dotted names (`api.lms.get_courses`),
 *    resolved against the composed app's own whitelist server-side.
 *  - control sites: only cmds carrying the `control:` prefix
 *    (`control:get_public_opportunities`).
 *
 * Tenant resolution (the Dart `HttpService` baseUrl + `TokenInterceptor`
 * pair, folded in here): one Next.js instance serves any number of
 * tenants, so the base URL is resolved PER CALL, never pinned at build
 * time — see [resolveTenantBaseUrl] for the order. Auth mirrors the Dart
 * interceptor: when the session carries API credentials they are sent as
 * `Authorization: token key:secret` unless the caller passes its own
 * header or `requireAuth: false`. Unlike the Dart app, which has ONE
 * baseUrl, a call here may be steered at another site (an explicit
 * `baseUrl` for the control plane), so the session's credentials only go
 * to the session's own site — never to a different origin. The gateway
 * door itself is guest-accessible on both roles, and the resolved
 * TARGET's own `allow_guest` policy decides server-side.
 *
 * Server-only: reading the session and the request host needs the
 * request scope. Client code imports the wire constants from
 * gateway-constants.ts and the telemetry lane from telemetry.ts instead.
 */

import { generateTraceId } from './telemetry';
import {
  PLATFORM_GATEWAY_METHOD,
  PLATFORM_GATEWAY_PATH,
} from './gateway-constants';
import {
  getPlatformSession,
  isNextRenderSignal,
  sessionAuthorization,
  type PlatformSession,
} from './session';
import {
  envBaseUrl,
  hasTenantHostLookup,
  hostFromHeaders,
  lookupTenantHost,
  normalizeSiteUrl,
  sameSite,
} from './tenant-hosts';
import { registerControlTenantHostResolver } from './tenant-host-control';

export { PLATFORM_GATEWAY_METHOD, PLATFORM_GATEWAY_PATH };

// base_sdk 1.20.0: the control site answers which tenant a request host
// belongs to (a custom domain), so the per-host step of
// resolveTenantBaseUrl below works with no host wiring. Idempotent, a
// no-op without ROKCT_BASE_URL or with ROKCT_TENANT_HOST_LOOKUP=off, and
// a host's own setTenantHostResolver call still replaces it.
registerControlTenantHostResolver();

/** Anything carrying request headers: a `Request`, a `NextRequest`, … */
export interface RequestLike {
  headers: { get(name: string): string | null };
}

export interface TenantResolutionInput {
  /**
   * Explicit backend origin — wins over every lookup. Use it for calls
   * that must reach a specific site regardless of who is signed in (the
   * control plane, a health check).
   */
  baseUrl?: string;
  /**
   * An already-resolved session (`null` = known to be signed out), so a
   * caller that has one does not pay for a second lookup. Omit to read
   * the current request's session.
   */
  session?: PlatformSession | null;
  /**
   * The request whose `Host` to map (route handlers, middleware — places
   * that hold the request). Omit inside server components/actions: the
   * headers come from `next/headers`.
   */
  request?: RequestLike | null;
}

/**
 * The tenant site the current call should talk to, resolved per request:
 *
 *  1. `input.baseUrl` — an explicit override.
 *  2. The signed-in user's tenant site (`session.user.siteName`, which
 *     auth_sdk records at login) — the site they logged into.
 *  3. The host name the request arrived on, mapped to a tenant site by
 *     `ROKCT_TENANT_HOSTS` or a registered resolver — only consulted when
 *     one of those is configured (`hasTenantHostLookup`), so env-only
 *     deployments never touch the request headers. Since 1.20.0 the
 *     control-backed resolver (tenant-host-control.ts) is registered
 *     whenever `ROKCT_BASE_URL` is set, so a tenant's custom domain
 *     resolves to its site here; non-public and the shell's own hosts
 *     answer nothing without a network call.
 *  4. `ROKCT_BASE_URL` / `NEXT_PUBLIC_ROKCT_BASE_URL` /
 *     `NEXT_PUBLIC_FRAPPE_URL` — the configured default.
 *
 * `undefined` when nothing resolves. Reading the session or headers
 * outside a request scope (or without the auth surface installed) is
 * treated as "nothing there" and falls through to the next step.
 */
export async function resolveTenantBaseUrl(
  input: TenantResolutionInput = {},
): Promise<string | undefined> {
  const explicit = normalizeSiteUrl(input.baseUrl);
  if (explicit) return explicit;

  const session =
    input.session !== undefined ? input.session : await getPlatformSession();
  const fromSession = normalizeSiteUrl(session?.user?.siteName);
  if (fromSession) return fromSession;

  if (hasTenantHostLookup()) {
    const fromHost = await lookupTenantHost(await requestHost(input.request));
    if (fromHost) return fromHost;
  }

  return envBaseUrl();
}

/**
 * The host the request arrived on, from the given request or, failing
 * that, from `next/headers` (loaded lazily so the module stays importable
 * outside a Next.js runtime, e.g. under a plain `tsc`/test run).
 */
async function requestHost(
  request?: RequestLike | null,
): Promise<string | undefined> {
  const fromRequest = hostFromHeaders(request?.headers);
  if (fromRequest) return fromRequest;
  try {
    const { headers } = await import('next/headers');
    return hostFromHeaders(await headers());
  } catch (e) {
    if (isNextRenderSignal(e)) throw e;
    return undefined; // no request scope (static render, script, test)
  }
}

export interface PlatformCallOptions extends TenantResolutionInput {
  /**
   * `'POST'` (the default) sends `{cmd, payload}` as a JSON body — the
   * canonical gateway contract, identical to the Dart client. `'GET'`
   * sends them as query params (`payload` JSON-stringified) so Next.js
   * fetch caching (`next.revalidate`) applies — use it for public,
   * cacheable reads; the gateway accepts both.
   */
  method?: 'GET' | 'POST';
  /**
   * Extra request headers — e.g. an idempotency key, or an explicit
   * `Authorization` that takes precedence over the session's credentials.
   */
  headers?: Record<string, string>;
  /**
   * Mirrors the Dart client's `requireAuth`: when `true` (the default) the
   * session's API credentials, if any, go out as
   * `Authorization: token key:secret` — but only to the session's own
   * site (`session.user.siteName`, or any target when the session names
   * none), never to a different origin the caller steered the call at.
   * `false` sends none (guest cmds, token refresh, public cacheable reads)
   * and, together with an explicit `baseUrl`, keeps the call free of any
   * request-scope reads.
   */
  requireAuth?: boolean;
  /**
   * `false` (the default) keeps the historical contract: `null` on any
   * failure. `true` throws a [PlatformGatewayError] instead — for callers
   * whose try/catch is their error handling (the `paasCall` semantics).
   */
  throwOnError?: boolean;
  /** Abort the request after this many milliseconds. Default 10000. */
  timeout?: number;
  /**
   * Merged into the `fetch()` init — e.g.
   * `{ next: { revalidate: 60 } }` or `{ cache: 'no-store' }`.
   */
  fetchOptions?: RequestInit & {
    next?: { revalidate?: number | false; tags?: string[] };
  };
}

/** Why a gateway call produced no result. */
export type PlatformGatewayFailure =
  | 'no_base_url'
  | 'http_error'
  | 'network_error';

/** Thrown by [platformCall] with `throwOnError: true`. */
export class PlatformGatewayError extends Error {
  readonly cmd: string;
  readonly reason: PlatformGatewayFailure;
  /** The HTTP status for `http_error`, otherwise `undefined`. */
  readonly status?: number;

  constructor(
    cmd: string,
    reason: PlatformGatewayFailure,
    status?: number,
    cause?: unknown,
  ) {
    super(`Platform gateway call failed: ${cmd}`);
    this.name = 'PlatformGatewayError';
    this.cmd = cmd;
    this.reason = reason;
    this.status = status;
    if (cause !== undefined) (this as { cause?: unknown }).cause = cause;
  }
}

/**
 * Executes [cmd] on the tenant site resolved for this call (see
 * [resolveTenantBaseUrl]), with [payload] as the target method's kwargs
 * (an object, or an already-JSON-stringified object — the gateway parses
 * either).
 *
 * Returns the target method's own return value with the Frappe `message`
 * envelope already unwrapped, or `null` on any failure (no base URL
 * resolved, non-2xx response, network error, timeout). Pass
 * `throwOnError: true` to get a [PlatformGatewayError] instead — or use
 * [paasCall], which also insists on a signed-in session.
 */
export async function platformCall<T = unknown>(
  cmd: string,
  payload?: Record<string, unknown> | string,
  options: PlatformCallOptions = {},
): Promise<T | null> {
  const requireAuth = options.requireAuth ?? true;
  const throwOnError = options.throwOnError ?? false;

  // The session is read at most once per call, and only when something
  // needs it: the tenant URL (no explicit baseUrl) or the credentials
  // (requireAuth without an explicit Authorization header).
  const callerAuthorization = findHeader(options.headers, 'authorization');
  const needsSession =
    !normalizeSiteUrl(options.baseUrl) || (requireAuth && !callerAuthorization);
  const session =
    options.session !== undefined
      ? options.session
      : needsSession
        ? await getPlatformSession()
        : null;

  const baseUrl = await resolveTenantBaseUrl({
    baseUrl: options.baseUrl,
    session,
    request: options.request,
  });
  if (!baseUrl) {
    if (throwOnError) throw new PlatformGatewayError(cmd, 'no_base_url');
    return null;
  }

  // Credentials stay with the site they belong to: a session that names
  // its tenant site only authenticates calls to that site.
  const sessionSite = session?.user?.siteName;
  const credentialsApply = !sessionSite || sameSite(sessionSite, baseUrl);
  const authorization =
    callerAuthorization ??
    (requireAuth && credentialsApply
      ? sessionAuthorization(session)
      : undefined);

  const method = options.method ?? 'POST';
  const timeout = options.timeout ?? 10000;
  const { headers: fetchHeaders, ...fetchRest } = options.fetchOptions ?? {};

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    let url = `${baseUrl}${PLATFORM_GATEWAY_PATH}`;
    const init: RequestInit & {
      next?: { revalidate?: number | false; tags?: string[] };
    } = {
      ...fetchRest,
      method,
      headers: {
        // ADR-006: stamp every gateway call with the shared trace-id format;
        // callers may override by passing their own x-trace-id header.
        'x-trace-id': generateTraceId(),
        ...(authorization ? { Authorization: authorization } : {}),
        ...(fetchHeaders as Record<string, string> | undefined),
        ...options.headers,
      },
      signal: controller.signal,
    };

    if (method === 'GET') {
      const params = new URLSearchParams({ cmd });
      if (payload !== undefined) {
        params.set(
          'payload',
          typeof payload === 'string' ? payload : JSON.stringify(payload),
        );
      }
      url += `?${params.toString()}`;
    } else {
      init.headers = {
        'Content-Type': 'application/json',
        ...(init.headers as Record<string, string>),
      };
      init.body = JSON.stringify({
        cmd,
        ...(payload !== undefined ? { payload } : {}),
      });
    }

    const res = await fetch(url, init);
    if (!res.ok) {
      if (throwOnError) {
        throw new PlatformGatewayError(cmd, 'http_error', res.status);
      }
      return null;
    }

    const data = await res.json();
    // Frappe wraps whitelisted returns in a top-level `message` envelope.
    return (data?.message || data) as T;
  } catch (e) {
    if (e instanceof PlatformGatewayError) throw e;
    console.error(`Platform gateway call failed: ${cmd}`, e);
    if (throwOnError) {
      throw new PlatformGatewayError(cmd, 'network_error', undefined, e);
    }
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Compatibility name for the paas-era shell's `app/lib/paas-gateway`
 * `paasCall`, with its exact semantics so call sites switch with a
 * one-line import change: requires a signed-in session (throws
 * `Error("Unauthorized")` otherwise), resolves the tenant site and
 * credentials from it, and throws `Error("PaaS gateway call failed: <cmd>")`
 * on any gateway failure instead of returning `null`.
 *
 * New code should call [platformCall] directly (with `throwOnError` when
 * it wants exceptions); this wrapper exists so the admin/manager server
 * actions keep their try/catch error handling unchanged.
 */
export async function paasCall<T = any>(
  cmd: string,
  args?: Record<string, unknown>,
): Promise<T> {
  const session = await getPlatformSession();
  if (!session || !session.user) throw new Error('Unauthorized');

  const result = await platformCall<T>(cmd, args, { session });
  if (result === null) {
    throw new Error(`PaaS gateway call failed: ${cmd}`);
  }
  return result;
}

function findHeader(
  headers: Record<string, string> | undefined,
  name: string,
): string | undefined {
  if (!headers) return undefined;
  const wanted = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === wanted && value) return value;
  }
  return undefined;
}
