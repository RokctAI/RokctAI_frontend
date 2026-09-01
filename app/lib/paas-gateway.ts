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

import "server-only";

import { getCurrentSession } from "@/app/(auth)/actions";
import { platformCall } from "@/app/services/base/platform-gateway";

/**
 * Authenticated tenant-site wrapper around the universal platform gateway
 * client (`platformCall`). Resolves the caller's PaaS site and API token
 * from the session — the same resolution `getPaaSClient` performs — and
 * executes `cmd` through the single `rokct.platform.api` entry point.
 *
 * `cmd` is the target module's manifest `whitelisted_methods` key with the
 * leading `{app_name}.` stripped (e.g. `api.order.create_order`); the
 * gateway resolves it against the composed app's whitelist server-side.
 *
 * Throws on failure (unauthorized session or failed gateway call) so
 * existing try/catch call sites keep their error semantics.
 */
export async function paasCall<T = any>(
  cmd: string,
  args?: Record<string, unknown>,
): Promise<T> {
  const session = await getCurrentSession();
  if (!session || !session.user) throw new Error("Unauthorized");

  const apiKey = (session.user as any).apiKey;
  const apiSecret = (session.user as any).apiSecret;
  const siteName = (session.user as any).siteName;

  // Mirror getPaaSClient's URL resolution: session site first, then the
  // configured default backend.
  let baseUrl: string | undefined = siteName;
  if (siteName && !siteName.startsWith("http")) {
    baseUrl = siteName.includes("localhost")
      ? `http://${siteName}`
      : `https://${siteName}`;
  }
  if (!baseUrl) {
    baseUrl = process.env.NEXT_PUBLIC_FRAPPE_URL || process.env.ROKCT_BASE_URL;
  }

  const result = await platformCall<T>(cmd, args, {
    ...(baseUrl ? { baseUrl } : {}),
    headers:
      apiKey && apiSecret
        ? { Authorization: `token ${apiKey}:${apiSecret}` }
        : undefined,
  });

  if (result === null) {
    throw new Error(`PaaS gateway call failed: ${cmd}`);
  }
  return result;
}
