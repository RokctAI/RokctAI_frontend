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
// The host shell's middleware, installed by auth_sdk (NextAuth-gated).
// Register PROVISIONING registry (auth_sdk 1.7.0): the server half of the
// register contract whose client half is
// components/custom/auth/register-registry.ts.
//
// The register page collects a submission; what happens to it - which
// backend the account is created on, what else is provisioned, whether and
// how the new user is signed in - is the home SDK's, not this SDK's. Until
// 1.7.0 app/(auth)/actions.ts register() carried ONE product's answer inline
// (a company and a tenant site provisioned at the control site under a
// platform administrator's keys, a plan, an industry, a voucher). That is
// gone from auth_sdk: a home SDK installs a module whose default export is
// a RegisterProvisioner and registers it with ONE line at the marker below
// through its manifest integrations,
//
//   { id: "<sdk>-register-provision", load: () => import("@/app/(auth)/<file>") },
//
// and [loadRegisterProvisioner] answers the FIRST entry that loads. With
// NOTHING registered the default is ./register-provision-default.ts: the
// account is created on the tenant site the request is for through the
// platform's guest `api.user.register_user` (the Dart auth SDK's own
// sign-up call) and signed in - a generic account, nothing provisioned.
//
// A second file with its own marker, rather than a second field on the
// config entry, because a provisioner is SERVER code (credentials, the
// gateway) and the config registry is imported by a client component: a
// dynamic import thunk on a client-reachable object would put the server
// module in the client bundle.

/** What the register form submitted, as the provisioner sees it. */
export interface RegisterSubmission {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  /** Every extra field the home SDK's config declared, by name; hidden fields included. */
  values: Record<string, string>;
  /**
   * The tenant site the request is for: the `site_name` the form carried,
   * else the `x-rokct-tenant-site` header of a resolved tenant host, else
   * null (the storefront - the provisioner decides where to register).
   */
  tenantSite: string | null;
}

/** How, if at all, the new account is signed in once provisioned. */
export interface RegisterSignIn {
  email: string;
  password: string;
  /** The site to sign in against; the credentials provider resolves one when absent. */
  siteName?: string | null;
  /** Extra credentials fields the provider understands (`is_onboarding`, ...). */
  extra?: Record<string, string>;
}

export type RegisterOutcome =
  | {
      status: "success";
      /** The site the account lives on, when known. */
      siteName?: string | null;
      /** Sign the account in now; `false` (or absent) leaves the visitor signed out (a verification mail, a site still being set up). */
      signIn?: RegisterSignIn | false;
      /** A line the page shows on success (what to do next). */
      message?: string;
    }
  | {
      status: "failed" | "user_exists" | "invalid_data";
      error?: string;
    };

export interface RegisterProvisioner {
  provision(submission: RegisterSubmission): Promise<RegisterOutcome>;
}

/** The shape of a registered provisioner's module. */
export interface RegisterProvisionerModule {
  default: RegisterProvisioner;
}

export interface RegisterProvisionEntry {
  /** Stable, unique across SDKs: "<sdk>-register-provision". */
  id: string;
  load: () => Promise<RegisterProvisionerModule>;
}

/**
 * Entries between the markers are injected by the installer; ONE marker in
 * this file, as in every registry. An entry is a single self-contained line
 * with a dynamic import. Do not remove or reformat the marker comments
 * inside the array literal.
 */
export const REGISTER_PROVISIONERS: RegisterProvisionEntry[] = [
  // @rokct-sdk-register-provision-start
  // @rokct-sdk-register-provision-end
];

/**
 * The provisioner this deployment uses: the first registered module that
 * loads, else the default. An entry that fails to load is logged and
 * skipped in favour of the next, then the default.
 */
export async function loadRegisterProvisioner(
  entries: RegisterProvisionEntry[] = REGISTER_PROVISIONERS,
  fallback: () => Promise<RegisterProvisionerModule> = () =>
    import("./register-provision-default"),
): Promise<RegisterProvisioner> {
  for (const entry of entries) {
    try {
      return (await entry.load()).default;
    } catch (error) {
      console.error(
        `[auth] failed to load register provisioner "${entry.id}":`,
        error,
      );
    }
  }
  return (await fallback()).default;
}
