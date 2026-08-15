/**
 * telemetry_sdk's Next.js client side (ADR-006 — previously zero files).
 *
 * Lives in base_sdk per ADR-005: the shared kernel is the one home every
 * SDK may import. The Frappe side (core/telemetry) already runs the generic
 * error pipeline (api_error_log doctype + log_frontend_error/
 * forward_error_to_control); this is the missing caller. Mirrors the Dart
 * client at base/dart/lib/src/services/telemetry.dart.
 */

// Module-scoped so this file typechecks with or without @types/node; the
// verbatim `process.env.NODE_ENV` expression is kept for Next.js inlining.
declare const process: { env: { NODE_ENV?: string } };

const isProduction = (): boolean => {
  try {
    return process.env.NODE_ENV === 'production';
  } catch {
    return true; // no `process` at all — stay quiet, as in production
  }
};

/**
 * One shared trace-id generator (ADR-006): the backend auto-populates
 * `trace_id` on any doctype carrying the field from the
 * X-Trace-ID/X-Request-ID header family. Every fetch wrapper and
 * interceptor must use THIS, never hand-roll another format.
 *
 * Format: `web-<epoch micros>-<8 hex chars>` (the Dart client uses `mob-`).
 */
// ==========================================
// [GENERATED TEMPLATE FILE]
// This file was installed from: base_sdk
// Feel free to modify and customize this code.
// Note: If you edit this file, the SDK installer will detect your changes
// and automatically skip overwriting it during future upgrades.
// ==========================================

export function generateTraceId(): string {
  const micros = Date.now() * 1000;
  const rand = Math.floor(Math.random() * 0x100000000)
    .toString(16)
    .padStart(8, '0');
  return `web-${micros}-${rand}`;
}

/**
 * `fetch` wrapper stamping every request with a trace id (kept if the
 * caller already set one). Drop-in replacement for the global `fetch`.
 */
export function tracedFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (!headers.has('x-trace-id')) {
    headers.set('x-trace-id', generateTraceId());
  }
  return fetch(input, { ...init, headers });
}

/**
 * `{app_name}.tenant.api.log_frontend_error` per the telemetry manifest's
 * whitelisted_methods mapping.
 */
export const TELEMETRY_ENDPOINT =
  '/api/method/paas.tenant.api.log_frontend_error';

export interface LogFrontendErrorOptions {
  /** Stable machine-readable class (snake_case). */
  type: string;
  /** Whatever is needed to debug without reproducing. */
  context?: Record<string, unknown>;
  sessionId?: string;
}

/**
 * Fire-and-forget structured event: {type, context, session_id, timestamp}.
 *
 * Contract: telemetry must never break the app — failures are swallowed
 * (logged locally), and every event logs its full payload outside
 * production so dev builds leave a usable trail even fully offline.
 */
export async function logFrontendError({
  type,
  context = {},
  sessionId,
}: LogFrontendErrorOptions): Promise<void> {
  const payload: Record<string, unknown> = {
    type,
    ...(sessionId !== undefined ? { session_id: sessionId } : {}),
    timestamp: new Date().toISOString(),
    context,
  };
  // Local trail first — real even when the endpoint is unreachable.
  if (!isProduction()) {
    console.debug(`==> telemetry ${JSON.stringify(payload)}`);
  }
  try {
    await tracedFetch(TELEMETRY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error_message: type,
        context: JSON.stringify(payload),
      }),
    });
  } catch (e) {
    if (!isProduction()) {
      console.debug(`==> telemetry delivery failed (${type}): ${e}`);
    }
  }
}
