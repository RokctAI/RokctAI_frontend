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

import 'server-only';

// The host shell's session seam — NOT an auth_sdk import. The bare shell
// commits a neutral copy of `app/lib/session.ts` whose functions resolve
// to null (no auth surface, no sessions); composing auth_sdk overwrites it
// with the NextAuth-backed implementation. This is the Next.js analogue of
// the Dart kernel's LocalStorage token that auth_sdk writes and
// TokenInterceptor reads: base defines what it needs from a session, the
// auth SDK fills it in at login. Listed in base's manifest `requires`.
//
// Runtime-only import cycle: app/lib/session -> app/(auth)/auth ->
// app/services/base/platform-gateway -> ./session -> app/lib/session.
// Safe because every side touches the other's symbols only inside function
// bodies.
import { getCurrentSession } from '@/app/lib/session';

/**
 * The slice of the signed-in user the kernel reads. auth_sdk populates
 * these in its NextAuth `session` callback (see its `types/next-auth.d.ts`);
 * every field is optional because a session may be a control-plane one
 * (no tenant site) or a tenant one without API credentials.
 */
export interface PlatformSessionUser {
  id?: string;
  /** Frappe API key half of the `token key:secret` credential. */
  apiKey?: string | null;
  /** Frappe API secret half of the `token key:secret` credential. */
  apiSecret?: string | null;
  /** The tenant site the user logged into: a site name or a full origin. */
  siteName?: string | null;
  roles?: string[];
  [extra: string]: unknown;
}

/** The kernel's view of a session: a user, or nothing. */
export interface PlatformSession {
  user?: PlatformSessionUser | null;
  [extra: string]: unknown;
}

/**
 * Whether a thrown value is Next.js steering its own render rather than a
 * failure: a static prerender reaching `cookies()`/`headers()`
 * (`DYNAMIC_SERVER_USAGE`, `NEXT_PRERENDER_INTERRUPTED`, a React
 * postpone) or `redirect()`/`notFound()` (`NEXT_REDIRECT`,
 * `NEXT_HTTP_ERROR_FALLBACK`). The framework must see these, so the
 * "no session" catch-alls in the kernel rethrow them instead of turning
 * them into `null`.
 */
export function isNextRenderSignal(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false;
  const digest = (e as { digest?: unknown }).digest;
  if (typeof digest === 'string') {
    return (
      digest.startsWith('NEXT_') ||
      digest === 'DYNAMIC_SERVER_USAGE' ||
      digest === 'BAILOUT_TO_CLIENT_SIDE_RENDERING'
    );
  }
  return (
    (e as { $$typeof?: unknown }).$$typeof === Symbol.for('react.postpone')
  );
}

/**
 * The current request's session through the host seam, or `null` when
 * there is none — including when the seam throws (no request scope, no
 * auth surface installed). Like `LocalStorage.getToken()` returning an
 * empty string, "no session" is a value, not an error; only Next's own
 * render signals ([isNextRenderSignal]) propagate.
 */
export async function getPlatformSession(): Promise<PlatformSession | null> {
  try {
    const session = (await getCurrentSession()) as PlatformSession | null;
    return session ?? null;
  } catch (e) {
    if (isNextRenderSignal(e)) throw e;
    return null;
  }
}

/**
 * The `Authorization` header value a session carries, or `undefined`
 * when it has no API credentials (guest, or a control-plane login without
 * a token). Frappe's `token <key>:<secret>` scheme, exactly as the shell's
 * `getPaaSClient` / `paasCall` sent it.
 */
export function sessionAuthorization(
  session?: PlatformSession | null,
): string | undefined {
  const apiKey = session?.user?.apiKey;
  const apiSecret = session?.user?.apiSecret;
  return apiKey && apiSecret ? `token ${apiKey}:${apiSecret}` : undefined;
}
