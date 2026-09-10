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

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Lazy connection, deliberately.
//
// This module used to read POSTGRES_URL and construct the postgres client at
// import time. That made a live database a BUILD-time requirement for every
// host composing auth_sdk: `next build` imports this module while collecting
// page data for app/(auth)/api/auth/[...nextauth] (route.ts -> auth.ts ->
// "@/db"), so a build with no POSTGRES_URL died with
// "Failed to collect page data for /api/auth/[...nextauth]" even though
// nothing needs a database to compile. Hosts worked around it by feeding the
// build a throwaway connection string, which is exactly the kind of
// placeholder that hides a real misconfiguration.
//
// The check still exists and still throws the same error with the same
// message - it just happens on FIRST USE instead of on import. A request that
// actually touches the database with POSTGRES_URL unset fails as loudly as it
// always did; a build that never runs a query no longer needs the variable at
// all. There is no default connection string and no silent fallback: no
// POSTGRES_URL still means no database.

function createDb() {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL environment variable is not set");
  }

  const client = postgres(process.env.POSTGRES_URL);
  return drizzle(client, { schema });
}

type Db = ReturnType<typeof createDb>;

let instance: Db | undefined;

// Memoised: the client is constructed once per process, exactly as the
// module-scope `const client` was, so pooling behaviour is unchanged.
function getDb(): Db {
  if (!instance) {
    instance = createDb();
  }
  return instance;
}

// A transparent stand-in for the drizzle instance. Callers keep writing
// `db.select()...`, `db.insert()...`, `db.transaction()...` unchanged; the
// first property access is what builds the client. Methods are bound to the
// real instance so drizzle's internal `this` is never the proxy.
export const db = new Proxy({} as Db, {
  get(_target, property) {
    const real = getDb();
    // `real` is also the receiver: a getter on drizzle's prototype must see
    // the real instance as `this`, never this proxy.
    const value = Reflect.get(real, property, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
  set(_target, property, value) {
    return Reflect.set(getDb(), property, value);
  },
  has(_target, property) {
    return Reflect.has(getDb(), property);
  },
});
