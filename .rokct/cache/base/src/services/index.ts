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

export {
  generateTraceId,
  tracedFetch,
  logFrontendError,
  TELEMETRY_CMD,
  type LogFrontendErrorOptions,
} from './telemetry';
export {
  PLATFORM_GATEWAY_METHOD,
  PLATFORM_GATEWAY_PATH,
  PLATFORM_METHOD_PATH,
} from './gateway-constants';
// Everything below is server-only (session + request headers); client
// code imports './telemetry' and './gateway-constants' directly.
export {
  platformCall,
  paasCall,
  resolveTenantBaseUrl,
  PlatformGatewayError,
  type PlatformCallOptions,
  type PlatformGatewayFailure,
  type RequestLike,
  type TenantResolutionInput,
} from './platform-gateway';
export {
  getPlatformSession,
  isNextRenderSignal,
  sessionAuthorization,
  type PlatformSession,
  type PlatformSessionUser,
} from './session';
export {
  NON_PUBLIC_HOSTS,
  NON_PUBLIC_HOST_SUFFIXES,
  envBaseUrl,
  hasTenantHostLookup,
  hostFromHeaders,
  isPublicHost,
  lookupTenantHost,
  normaliseHost,
  normalizeSiteUrl,
  requestHost,
  resetTenantHostMap,
  sameSite,
  setTenantHostResolver,
  tenantHostMap,
  type HeaderReader,
  type TenantHostResolver,
} from './tenant-hosts';
// Edge-safe (pure kernel imports + global fetch): middleware may import
// './tenant-host-control' directly.
export {
  TENANT_HOST_NEGATIVE_TTL_MS,
  TENANT_HOST_POSITIVE_TTL_MS,
  TENANT_HOST_RESOLVE_METHOD,
  TENANT_HOST_STALE_TTL_MS,
  TENANT_HOST_TIMEOUT_MS,
  TENANT_SITE_HEADER,
  alternateTenantOrigin,
  cachedTenantHost,
  cachedTenantSite,
  controlBaseUrl,
  controlTenantHostResolver,
  ownHosts,
  registerControlTenantHostResolver,
  resetControlTenantHostResolver,
  resetTenantHostCache,
  resolveTenantHost,
  resolveTenantSiteByHost,
  resolveTenantSiteForRequest,
  sameTenantOrigin,
  setTenantHostFetch,
  tenantHostLookupEnabled,
  tenantHostNegativeTtlMs,
  tenantHostPositiveTtlMs,
  tenantHostStaleTtlMs,
  tenantHostTimeoutMs,
  type TenantHostFetch,
  type TenantHostSite,
} from './tenant-host-control';
