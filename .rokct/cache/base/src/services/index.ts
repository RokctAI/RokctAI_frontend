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
  envBaseUrl,
  hasTenantHostLookup,
  hostFromHeaders,
  lookupTenantHost,
  normalizeSiteUrl,
  resetTenantHostMap,
  sameSite,
  setTenantHostResolver,
  tenantHostMap,
  type TenantHostResolver,
} from './tenant-hosts';
