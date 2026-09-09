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

// The DEFAULT tenant link: the local Postgres store this SDK installs.
//
// This is the code that used to sit inline in ./auth.ts and ./actions.ts,
// moved behind ./tenant-link.ts's seam and otherwise unchanged - the same
// drizzle queries, in the same order, with the same conditions. A host that
// registers nothing and sets no ROKCT_TENANT_LINK gets this, so composing
// auth_sdk still means exactly what it meant before the seam existed.
//
// Keep it that way. The local store is the multi-tenancy feature:
// rokctai_frontend maps every user to the tenant base URL they came from
// through the `User.siteName` column read here, and deliveryplatform will do
// the same. The seam exists so a SINGLE-tenant shell can opt out, never so
// this path can be removed.

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { globalSettings, user } from "@/db/schema";

import type {
  TenantLink,
  TenantLinkAdmin,
  TenantLinkLogin,
  TenantLinkRecord,
  TenantLinkRegistration,
} from "./tenant-link";

const databaseTenantLink: TenantLink = {
  async resolveLink(email: string): Promise<TenantLinkRecord | null> {
    // `.limit(1)` and the email predicate are the original query; `null` for
    // no row is what ./auth.ts used to read off `dbUser.length > 0`.
    const rows = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    if (rows.length === 0) return null;
    return { siteName: rows[0].siteName ?? null };
  },

  async rememberLogin(email: string, login: TenantLinkLogin): Promise<void> {
    // Only ever called when resolveLink() found a row, so this stays the
    // UPDATE it always was - a login never creates a local user.
    await db
      .update(user)
      .set({
        apiKey: login.apiKey, // Might be null for tenants
        apiSecret: login.apiSecret, // Might be null for tenants
        siteName: login.siteName,
      })
      .where(eq(user.email, email));
  },

  async linkRegistration(
    email: string,
    registration: TenantLinkRegistration,
  ): Promise<void> {
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingUser.length === 0) {
      await db.insert(user).values({
        id: email,
        email: email,
        siteName: registration.siteName,
        onboardingData: registration.onboardingData,
      });
    } else {
      await db
        .update(user)
        .set({
          siteName: registration.siteName,
          onboardingData: registration.onboardingData,
        })
        .where(eq(user.email, email));
    }
  },

  async adminCredentials(): Promise<TenantLinkAdmin | null> {
    // Retrieve Admin Keys from GlobalSettings (set via Admin Login).
    const settings = await db.select().from(globalSettings).limit(1);
    const adminKey = settings.length > 0 ? settings[0].adminApiKey : null;
    const adminSecret = settings.length > 0 ? settings[0].adminApiSecret : null;
    if (!adminKey || !adminSecret) return null;
    return { apiKey: adminKey, apiSecret: adminSecret };
  },
};

export default databaseTenantLink;
