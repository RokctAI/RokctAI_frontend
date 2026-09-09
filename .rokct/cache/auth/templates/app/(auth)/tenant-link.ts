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

// Tenant-link registry for the credentials flow (./auth.ts, ./actions.ts).
//
// A "tenant link" is the answer to three questions the login and register
// paths ask that have nothing to do with authenticating anybody:
//
//   1. WHICH tenant site does this email sign in against, when the form did
//      not name one? (./auth.ts, before the gateway login call.)
//   2. WHERE do the keys and site this login produced get remembered?
//      (./auth.ts, after it.)
//   3. Under WHICH platform administrator does a registration provision?
//      (./actions.ts, before the provisioning call, and getIndustries().)
//
// Until now there was exactly one answer to all three: the local Postgres
// store this SDK installs (db/, lib/drizzle/). That store is a
// MULTI-TENANCY feature, not an auth feature - it maps a user to the base
// URL they came from - and a deployment that serves many tenant backends
// genuinely needs it: rokctai_frontend reads it on every login and migrates
// it before `next build`.
//
// A shell dedicated to ONE tenant has nothing to map. It knows its backend
// from its own environment, and asking it to run a Postgres instance so the
// login form can look up an answer it already has is a database it keeps
// only to ignore. Worse, the lookup sat in the `try` of the block whose
// `catch` returns `null`, so on a shell with no database configured every
// login failed as "invalid credentials" - the misconfiguration was invisible.
//
// So the three operations get a seam. An SDK installs a module whose default
// export is a TenantLink and registers it with ONE line at the marker below
// through its manifest integrations:
//
//   { id: "<sdk>-tenant-link", load: () => import("@/app/(auth)/<file>") },
//
// [loadTenantLink] answers the FIRST entry that loads (one shell, one link,
// exactly as base_sdk's ./hero-form.ts picks one form and its
// ./plans-query.ts picks one query). With NOTHING registered the loop does
// not run and the answer is the built-in named by ROKCT_TENANT_LINK, whose
// default is "database" - the drizzle-backed implementation that is this
// file's whole reason for existing in the first place, behaviour-identical
// to the inline code it replaced. rokctai_frontend sets no such variable and
// registers nothing, so it reads and writes Postgres exactly as before.
//
// A single-tenant shell that composes no SDK of its own selects the other
// built-in with one committed line of config instead - `env: {
// ROKCT_TENANT_LINK: "single-tenant" }` in its own next.config.mjs, which is
// host-owned and therefore survives a compose (an SDK-installed file does
// not: scripts/compose.sh reconcile_tracked_host_files() documents that the
// SDK copy wins at build time). See ./tenant-link-single.ts.
//
// Entries between the markers below are injected by the Rokct SDK installer
// (sdk_installer_base.py update_integrations()) - the same contract as
// base_sdk's landing registries, and ONE marker in this file for the same
// reason those carry one each: the installer anchors successive entries for
// a target file after the previous entry, whichever marker they named, so a
// second marker in the same file is silently never injected into. An entry
// is a single self-contained line with a dynamic import (no import statement
// of its own). Do not remove or reformat the marker comments inside the
// array literal.

/** The local record of which site an email is linked to, if any. */
export interface TenantLinkRecord {
  /**
   * The tenant site this email last signed in against - a bare host
   * (`tenant-a.rokct.ai`) or an origin (`https://tenant-a.rokct.ai`); both
   * are accepted. `null` when the record exists but names no site yet.
   */
  siteName: string | null;
}

/** What a successful login produced and wants remembered. */
export interface TenantLinkLogin {
  apiKey: string | null;
  apiSecret: string | null;
  siteName: string;
}

/** What a successful registration produced and wants linked. */
export interface TenantLinkRegistration {
  siteName: string | null;
  onboardingData: unknown;
}

/**
 * The platform administrator a registration provisions under. These are
 * credentials: never log them, never return them to a client component.
 */
export interface TenantLinkAdmin {
  apiKey: string;
  apiSecret: string;
}

export interface TenantLink {
  /**
   * The link record for this email, or `null` when there is none.
   *
   * ./auth.ts uses the answer twice, and the difference between `null` and a
   * record whose `siteName` is `null` matters to both: a record's `siteName`
   * is the site to sign in against when the form named none, and the
   * PRESENCE of a record is what decides whether [rememberLogin] is called
   * at all. The drizzle implementation answers `null` for "no row".
   */
  resolveLink(email: string): Promise<TenantLinkRecord | null>;

  /**
   * Remember the keys and site a login produced, for an email that
   * [resolveLink] answered with a record. Called for its side effect only; a
   * link with nothing to remember implements it as a no-op.
   */
  rememberLogin(email: string, login: TenantLinkLogin): Promise<void>;

  /**
   * Link a newly registered user to the site that was provisioned for them,
   * creating the record when there is none. Called for its side effect only;
   * a link with nowhere to write implements it as a no-op.
   */
  linkRegistration(
    email: string,
    registration: TenantLinkRegistration,
  ): Promise<void>;

  /**
   * The platform administrator the provisioning calls go out as, or `null`
   * when this deployment has none configured - in which case registration
   * stops with "System not initialized" rather than calling the control
   * plane unauthenticated.
   */
  adminCredentials(): Promise<TenantLinkAdmin | null>;
}

/** The shape of a registered link's module. */
export interface TenantLinkModule {
  default: TenantLink;
}

export interface TenantLinkEntry {
  /** Stable, unique across SDKs: "<sdk>-tenant-link". */
  id: string;
  load: () => Promise<TenantLinkModule>;
}

export const TENANT_LINK: TenantLinkEntry[] = [
  // @rokct-sdk-tenant-link-start
  // @rokct-sdk-tenant-link-end
];

/**
 * The built-ins, by the name `ROKCT_TENANT_LINK` selects them with. Both are
 * reached by dynamic import so that selecting one does not EVALUATE the
 * other: "single-tenant" must never pull `@/db` into the module graph it
 * runs, which is the whole point of the seam.
 */
const BUILT_IN: Record<string, () => Promise<TenantLinkModule>> = {
  database: () => import("./tenant-link-database"),
  "single-tenant": () => import("./tenant-link-single"),
};

/**
 * Which built-in answers when no SDK registered one. Unset means
 * "database", so a host that knows nothing about this seam keeps the
 * drizzle-backed behaviour it always had. Read as a plain
 * `process.env.ROKCT_TENANT_LINK` so a host can also set it the compile-time
 * way, through `env` in its own next.config.mjs.
 */
const BUILT_IN_NAME = (process.env.ROKCT_TENANT_LINK || "database")
  .trim()
  .toLowerCase();

/**
 * The tenant link this deployment uses: the first registered module that
 * loads, else the built-in named by `ROKCT_TENANT_LINK`.
 *
 * An entry that fails to load is logged and skipped in favour of the next
 * one, and an unknown `ROKCT_TENANT_LINK` is logged and treated as
 * "database", so a broken registration degrades to the documented default
 * rather than to a login that silently rejects everybody.
 */
export async function loadTenantLink(): Promise<TenantLink> {
  for (const entry of TENANT_LINK) {
    try {
      return (await entry.load()).default;
    } catch (error) {
      console.error(`[auth] failed to load tenant link "${entry.id}":`, error);
    }
  }
  const builtIn = BUILT_IN[BUILT_IN_NAME];
  if (!builtIn) {
    console.error(
      `[auth] unknown ROKCT_TENANT_LINK "${BUILT_IN_NAME}"; using "database".`,
    );
    return (await BUILT_IN.database()).default;
  }
  return (await builtIn()).default;
}
