/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
