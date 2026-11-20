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

// Server side of the language switch. t() is synchronous and is called from
// hundreds of server and client components, but Next's cookies() is async.
// So the root layout awaits the cookie once (getRequestLocale, which also
// makes the route dynamic) and this module installs a resolver that t()
// reads synchronously. The resolver reads Next's own per-request store, so
// concurrent requests never see each other's language; anything it cannot
// read falls back to English.
import "server-only";
import { cookies } from "next/headers";
import { workUnitAsyncStorage } from "next/dist/server/app-render/work-unit-async-storage.external";
import { LANG_COOKIE, normalizeLocale, type Locale } from "./index";

(globalThis as Record<string, unknown>).__rokctLocaleResolver = (): Locale => {
  const store = workUnitAsyncStorage.getStore() as
    | { cookies?: { get(name: string): { value: string } | undefined } }
    | undefined;
  return normalizeLocale(store?.cookies?.get?.(LANG_COOKIE)?.value);
};

export async function getRequestLocale(): Promise<Locale> {
  const jar = await cookies();
  return normalizeLocale(jar.get(LANG_COOKIE)?.value);
}
