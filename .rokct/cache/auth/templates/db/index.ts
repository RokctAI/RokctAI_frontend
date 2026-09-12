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

// Merge sslmode=require into the connection URL instead of passing it raw.
//
// `postgres(process.env.POSTGRES_URL)` asks for no TLS at all when the value
// carries no sslmode parameter: postgres-js derives ssl=false and connects in
// clear text. The host's own db/queries.ts already merges sslmode=require for
// the very same variable, so one deployment disagreed with itself about
// whether its database traffic was encrypted - the chat path required TLS
// while the login and webhook paths composed from here did not.
//
// MERGED, not appended. `${POSTGRES_URL}?sslmode=require` adds a SECOND "?"
// whenever the value already has a query string - the normal Neon/Supabase
// shape - and the driver folds it into the last parameter it saw:
//   ...?channel_binding=require&sslmode=require  ->  ssl="require?sslmode=require"
//   ...?pgbouncer=true&connection_limit=1        ->  ssl=false, connection_limit="1?sslmode=require"
// The first is an unrecognised TLS mode, so postgres-js skips the
// rejectUnauthorized:false it applies for a real "require" and demands full
// certificate verification; the second drops TLS entirely and corrupts the
// pooler setting. Either way the parameter meant to be added is the one that
// breaks. Setting it through the URL's own parser cannot produce either.
//
// Only when the operator has not already chosen: sslmode=disable keeps
// saying disable, and a second pass changes nothing the first one did.
//
// Deliberately a DUPLICATE of the host's helper rather than an import of it.
// auth_sdk's `requires` list does not name db/queries.ts - that file belongs
// to the host - so this template has to stand alone in a repo where it does
// not exist. The body is kept identical to the host's copy so the two diff
// cleanly and stay in step; change one and change the other.
function withSslMode(url: string): string {
  try {
    let parsed = new URL(url);
    if (!parsed.searchParams.has("sslmode")) {
      parsed.searchParams.set("sslmode", "require");
    }
    return parsed.toString();
  } catch {
    // Unparseable, so hand it to the driver untouched rather than throwing -
    // and nothing is left without TLS by doing so. postgres-js runs the value
    // through `new URL()` itself in its own parseUrl, so a string this catch
    // sees is one the driver cannot parse either: it raises its own
    // "Invalid URL" from the postgres() call below instead of quietly
    // connecting in clear text.
    console.error(
      "POSTGRES_URL is not a parseable URL; passing it to the driver without merging sslmode=require.",
    );
    return url;
  }
}

function createDb() {
  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL environment variable is not set");
  }

  const client = postgres(withSslMode(process.env.POSTGRES_URL));
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
