import "server-only";

import type { FrappeApp } from "frappe-js-sdk";

/**
 * Executes a whitelisted dotted method on the site the given client points
 * at, as a real HTTP request.
 *
 * Frappe-js-sdk's `FrappeApp.call()` takes zero arguments and returns a
 * `FrappeCall` helper object, so the legacy `client.call({ method, args })`
 * shape silently did nothing. This helper POSTs `args` as the method's
 * kwargs to `/api/v1/method/{method}` through the client's own axios
 * instance (which already carries the base URL and auth headers), and
 * returns the full response body — the Frappe `message` envelope is
 * preserved, so existing `response?.message` consumers keep working.
 *
 * Throws on any non-2xx response (axios semantics), so existing try/catch
 * call sites keep their error handling.
 */
export async function frappeRpc<T = any>(
  client: FrappeApp,
  method: string,
  args: Record<string, unknown> = {},
  headers?: Record<string, string>,
): Promise<T> {
  const res = await client.axios.post(
    `/api/v1/method/${method}`,
    args,
    headers ? { headers } : undefined,
  );
  return res.data as T;
}
