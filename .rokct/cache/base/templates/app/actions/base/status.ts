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

"use server";

// The platform status the footer chrome row shows
// (components/custom/footer-chrome.tsx).
//
// Server-side on purpose, and not only because the gateway client is
// server-only: the row renders for anonymous visitors, so the cmds it runs
// must be fixed here rather than handed in from the browser. A client that
// could name the cmd would turn this action into a guest proxy for the
// whole gateway.

import {
  PlatformGatewayError,
  platformCall,
} from "@/app/services/base/platform-gateway";
import {
  isProbeAnswer,
  readPlatformVersion,
  resolvePlatformStatusProbes,
  type PlatformStatus,
} from "@/components/custom/landing/footer-chrome-config";

/**
 * The control plane's origin, for the `control` probe.
 *
 * A dedicated name because `ROKCT_BASE_URL` means different things per
 * shell: on rokctai_frontend it IS the control site, on a single-tenant
 * shell it is that tenant. `ROKCT_CONTROL_BASE_URL` says which one is
 * control without guessing, and falls back to the configured default so a
 * control-plane shell needs no new variable. Only consulted when the
 * control probe is opted in through `ROKCT_STATUS_SOURCE`.
 */
function controlBaseUrl(): string | undefined {
  return (
    process.env.ROKCT_CONTROL_BASE_URL ??
    process.env.NEXT_PUBLIC_ROKCT_CONTROL_BASE_URL ??
    process.env.ROKCT_BASE_URL ??
    process.env.NEXT_PUBLIC_ROKCT_BASE_URL ??
    undefined
  );
}

/**
 * Reads a state out of whatever a probe answered.
 *
 * `api.system.api_status` answers the base_sdk envelope
 * `{data: {status: "ok" | "maintenance", version, user}}`; the gateway's own
 * `message` wrapper is already off by the time platformCall returns. Any
 * other answering cmd (control's version map, for one) carries no `status`
 * field, and an answer WITH SOMETHING IN IT is the signal - which is how
 * rokct.ai's host footer decides. Since 1.40.0 a 2xx whose resolved body
 * is null, not an object, or an empty object is not an answer
 * ([isProbeAnswer]): a proxy or a placeholder page in front of a backend
 * that is not there answers 200 with nothing, and that must read as
 * offline, not operational. Only a real answer reaches this reader.
 */
function readProbeAnswer(answer: Record<string, unknown>): {
  maintenance: boolean;
  version: string | null;
} {
  const body = answer;
  const data = (body.data ?? body) as Record<string, unknown>;
  const status = typeof data.status === "string" ? data.status.toLowerCase() : "";
  return { maintenance: status === "maintenance", version: readPlatformVersion(answer) };
}

/**
 * The platform status, probed in the order
 * [resolvePlatformStatusProbes] gives: the tenant site ONLY by default
 * (since 1.37.0 - Ray, 2026-09-09: every shell reads its footer status
 * from its own tenant backend, never from control), the control plane
 * only when `ROKCT_STATUS_SOURCE` names it, or neither when it says `off`.
 *
 * The FIRST probe that answers decides. A probe that cannot run at all
 * because no origin is configured for its site is skipped without counting
 * as a failure, so a shell with no backend wired up reports `unconfigured`
 * (the row then shows no indicator) instead of claiming the platform is
 * down. `offline` means every configured probe was tried and none answered
 * - a 2xx with an empty body counts as tried and not answered (1.40.0).
 *
 * Both default cmds are guest-accessible, so this never needs a session, and
 * it sends no credentials.
 */
export async function getPlatformStatus(): Promise<PlatformStatus> {
  const probes = resolvePlatformStatusProbes(process.env.ROKCT_STATUS_SOURCE);
  let attempted = false;

  for (const probe of probes) {
    const baseUrl = probe.site === "control" ? controlBaseUrl() : undefined;
    // A control probe with no control origin cannot be attempted at all.
    if (probe.site === "control" && !baseUrl) continue;

    try {
      const answer = await platformCall<unknown>(probe.cmd, probe.payload, {
        baseUrl,
        requireAuth: false,
        throwOnError: true,
        timeout: 5000,
      });
      attempted = true;
      // A 2xx with nothing in it (null, a scalar, an array, {}) is a proxy
      // or a placeholder where the backend should be: not an answer.
      if (!isProbeAnswer(answer)) continue;
      const { maintenance, version } = readProbeAnswer(answer);
      return {
        state: maintenance ? "maintenance" : "operational",
        site: probe.site,
        version,
      };
    } catch (error) {
      // A tenant probe with no resolvable tenant was never attempted
      // either; anything else is a site that was asked and did not answer.
      if (
        !(
          error instanceof PlatformGatewayError &&
          error.reason === "no_base_url"
        )
      ) {
        attempted = true;
      }
    }
  }

  return { state: attempted ? "offline" : "unconfigured", site: null };
}
