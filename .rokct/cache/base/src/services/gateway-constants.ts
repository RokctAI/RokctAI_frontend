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
 * The platform gateway's wire constants — split out of platform-gateway.ts
 * so the isomorphic telemetry lane (telemetry.ts, callable from client
 * components) can import them without pulling the server-only gateway
 * client (session + request headers) into a client bundle. Import these
 * from here in client code; server code may keep importing them from
 * platform-gateway.ts, which re-exports them.
 */

/**
 * The universal platform entry-point method name — the ONE place the
 * gateway's dotted method lives, so a future rename is a single-constant
 * change. Never hardcode the method name elsewhere — import this.
 */
export const PLATFORM_GATEWAY_METHOD = 'rokct.platform.api';

/**
 * The versioned method prefix every client-facing endpoint URL carries
 * (project ruling: `/api/v1/method/<name>`; the Frappenize fork mounts the
 * same v1 rules under both `/api` and `/api/v1`). Never hardcode this
 * elsewhere — import it, or [PLATFORM_GATEWAY_PATH] for the gateway.
 */
export const PLATFORM_METHOD_PATH = '/api/v1/method';

/**
 * The full request path derived from [PLATFORM_GATEWAY_METHOD] under
 * [PLATFORM_METHOD_PATH]. Never hardcode this elsewhere — import it.
 */
export const PLATFORM_GATEWAY_PATH = `${PLATFORM_METHOD_PATH}/${PLATFORM_GATEWAY_METHOD}`;
