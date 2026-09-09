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

// The SINGLE-TENANT tenant link: no local store at all.
//
// Selected by `ROKCT_TENANT_LINK=single-tenant` (see ./tenant-link.ts), or by
// an SDK that registers this module at the marker there. It imports neither
// `@/db` nor drizzle nor postgres, so a deployment that selects it never
// opens a database connection on the login or register path - there is
// nothing to connect to and nothing it would have learned by connecting.
//
// Every answer comes from the one fact a single-tenant deployment already
// knows: its backend. That is resolved by base_sdk's kernel
// (app/services/base/tenant-hosts.ts `envBaseUrl()`, the
// ROKCT_BASE_URL -> NEXT_PUBLIC_ROKCT_BASE_URL -> NEXT_PUBLIC_FRAPPE_URL
// chain every other service in the shell reads), not by a second mechanism
// of this SDK's own. A shell that reaches the gateway at all has it set.
//
// The two WRITES are deliberate no-ops, not failures. `User.siteName` and
// `User.onboardingData` exist so a multi-tenant deployment can remember
// which of many backends a user belongs to; where there is exactly one
// backend the row would record a constant. The authoritative user record
// lives on the tenant site either way, reached through the gateway, and
// nothing in this shell reads the local copy back.

import { envBaseUrl } from "@/app/services/base/tenant-hosts";

import type {
  TenantLink,
  TenantLinkAdmin,
  TenantLinkLogin,
  TenantLinkRecord,
  TenantLinkRegistration,
} from "./tenant-link";

/**
 * The one site this deployment serves, as a full origin.
 *
 * An ORIGIN, not the bare host the drizzle-backed `User.siteName` column
 * stores, because the two are not interchangeable downstream: ./auth.ts turns
 * a bare name into `https://${name}`, which silently rewrites the scheme and
 * drops a port, while a value that already carries a scheme is kept verbatim.
 * base_sdk's `normalizeSiteUrl()` - which every reader of
 * `session.user.siteName` goes through, `resolveTenantBaseUrl()` included -
 * accepts an origin unchanged, so handing one up is both safe and lossless.
 * `null` when no base URL is configured at all, which is a real
 * misconfiguration and is allowed to surface as one.
 */
function configuredSite(): string | null {
  return envBaseUrl() ?? null;
}

const singleTenantTenantLink: TenantLink = {
  async resolveLink(_email: string): Promise<TenantLinkRecord | null> {
    // Every user of a single-tenant shell signs in against that tenant, so
    // there is always a link and it always names the configured site. A
    // login form that supplied its own `site_name` still wins in ./auth.ts;
    // this is the answer for the /login form, which supplies none.
    const siteName = configuredSite();
    if (!siteName) return null;
    return { siteName };
  },

  async rememberLogin(_email: string, _login: TenantLinkLogin): Promise<void> {
    // Nothing to remember: the site is configuration, and the API keys for
    // this session are held in the NextAuth JWT (there is no adapter and no
    // session table - see ./auth.ts's jwt/session callbacks).
  },

  async linkRegistration(
    _email: string,
    _registration: TenantLinkRegistration,
  ): Promise<void> {
    // Nothing to write: provisioning already created the user on the tenant
    // site, which is the record that matters.
  },

  async adminCredentials(): Promise<TenantLinkAdmin | null> {
    // The drizzle default reads these off the GlobalSettings row, which is
    // itself only a cache of "an administrator signed in here once". A shell
    // with no local store reads them from its own deployment secrets
    // instead. They are NOT fetched from the gateway: registration is a
    // guest call with no session, so an unauthenticated cmd that handed out
    // administrator credentials would be a credential oracle open to the
    // internet. Unset means "not initialized", exactly as an empty
    // GlobalSettings row does, and registration stops with that message
    // rather than calling the control plane unauthenticated.
    const apiKey = process.env.ROKCT_ADMIN_API_KEY;
    const apiSecret = process.env.ROKCT_ADMIN_API_SECRET;
    if (!apiKey || !apiSecret) return null;
    return { apiKey, apiSecret };
  },
};

export default singleTenantTenantLink;
