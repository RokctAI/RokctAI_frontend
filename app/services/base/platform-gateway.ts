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
 * Auth: the gateway door is guest-accessible on both roles; the resolved
 * TARGET's own `allow_guest` policy decides server-side. Authenticated
 * server-side calls pass an Authorization header via `options.headers`;
 * guest cmds need no headers at all.
 */

// Module-scoped so this file typechecks with or without @types/node; the
// `process.env.*` expressions are kept verbatim for Next.js inlining.
declare const process: { env: Record<string, string | undefined> };

/**
 * The universal platform entry-point method name — the ONE place the
 * gateway's dotted method lives, so a future rename is a single-constant
 * change. Never hardcode the method name elsewhere — import this.
 */
// ==========================================
// [GENERATED TEMPLATE FILE]
// This file was installed from: base_sdk
// Feel free to modify and customize this code.
// Note: If you edit this file, the SDK installer will detect your changes
// and automatically skip overwriting it during future upgrades.
// ==========================================

export const PLATFORM_GATEWAY_METHOD = "rokct.platform.api";

/**
 * The full request path derived from [PLATFORM_GATEWAY_METHOD]. Never
 * hardcode this elsewhere — import it.
 */
export const PLATFORM_GATEWAY_PATH = `/api/v1/method/${PLATFORM_GATEWAY_METHOD}`;

export interface PlatformCallOptions {
  /**
   * Backend origin (e.g. `https://control.example.com`). Defaults to
   * `process.env.ROKCT_BASE_URL` (server-side), falling back to
   * `process.env.NEXT_PUBLIC_ROKCT_BASE_URL` (also available client-side).
   */
  baseUrl?: string;
  /**
   * `'POST'` (the default) sends `{cmd, payload}` as a JSON body — the
   * canonical gateway contract, identical to the Dart client. `'GET'`
   * sends them as query params (`payload` JSON-stringified) so Next.js
   * fetch caching (`next.revalidate`) applies — use it for public,
   * cacheable reads; the gateway accepts both.
   */
  method?: "GET" | "POST";
  /**
   * Extra request headers — e.g. `Authorization` for authenticated
   * server-side calls, or an idempotency key.
   */
  headers?: Record<string, string>;
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

/**
 * Executes [cmd] on the backend selected by the base URL, with [payload]
 * as the target method's kwargs (an object, or an already-JSON-stringified
 * object — the gateway parses either).
 *
 * Returns the target method's own return value with the Frappe `message`
 * envelope already unwrapped, or `null` on any failure (no base URL
 * configured, non-2xx response, network error, timeout) — callers that
 * need to distinguish failures should catch at a different layer.
 */
export async function platformCall<T = unknown>(
  cmd: string,
  payload?: Record<string, unknown> | string,
  options: PlatformCallOptions = {},
): Promise<T | null> {
  const baseUrl =
    options.baseUrl ??
    process.env.ROKCT_BASE_URL ??
    process.env.NEXT_PUBLIC_ROKCT_BASE_URL;
  if (!baseUrl) return null;

  const method = options.method ?? "POST";
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
        ...(fetchHeaders as Record<string, string> | undefined),
        ...options.headers,
      },
      signal: controller.signal,
    };

    if (method === "GET") {
      const params = new URLSearchParams({ cmd });
      if (payload !== undefined) {
        params.set(
          "payload",
          typeof payload === "string" ? payload : JSON.stringify(payload),
        );
      }
      url += `?${params.toString()}`;
    } else {
      init.headers = {
        "Content-Type": "application/json",
        ...(init.headers as Record<string, string>),
      };
      init.body = JSON.stringify({
        cmd,
        ...(payload !== undefined ? { payload } : {}),
      });
    }

    const res = await fetch(url, init);
    if (!res.ok) return null;

    const data = await res.json();
    // Frappe wraps whitelisted returns in a top-level `message` envelope.
    return (data?.message || data) as T;
  } catch (e) {
    console.error(`Platform gateway call failed: ${cmd}`, e);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
