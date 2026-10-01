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

// auth_sdk 1.9.0: where a visitor goes after signing in or signing up.
// A link like /register?next=/opportunities/tenders/ABC123 brings them back
// to the page they came from (Ray, 2026-10-01: a Reel viewer must not lose
// the tender they saw because they had to sign up first). Only a path on
// this same site is honoured; anything else falls back to the usual home.
// Pure and import-free: tests/return-to.test.mts runs it staged flat.

export const RETURN_TO_PARAM = "next";

const MAX_LENGTH = 512;
const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

/** The same-site path in `raw`, or null when there is none to honour. */
export function safeReturnPath(raw: string | string[] | null | undefined): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || value.length > MAX_LENGTH) return null;
  // One leading slash and nothing a browser reads as another host:
  // "//evil", "/\evil", or control characters it would strip first.
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  if (/[\u0000-\u001f\u007f\\]/.test(value)) return null;
  const path = value.split(/[?#]/, 1)[0];
  if (AUTH_PATHS.some((p) => path === p || path.startsWith(`${p}/`))) return null;
  return value;
}

/** `href` with the return path carried along, for links between login and register. */
export function withReturnPath(href: string, next: string | null): string {
  if (!next) return href;
  const sep = href.includes("?") ? "&" : "?";
  return `${href}${sep}${RETURN_TO_PARAM}=${encodeURIComponent(next)}`;
}
