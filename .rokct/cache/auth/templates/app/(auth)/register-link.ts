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
// The post-register local link (auth_sdk 1.7.0): auth's OWN step once ANY
// register provisioner - the default or an injected one - has succeeded.
//
// Until 1.7.0 register() in ./actions.ts ended its provisioning with one
// unconditional call, tenantLink.linkRegistration(email, { siteName,
// onboardingData }): the local user row that maps the new account to the
// site it was registered against. That row is the MULTI-TENANCY feature
// (Ray, 2026-09-08): a shell that serves many tenant backends reads it on
// every later login (./auth.ts resolveLink) to find the base URL a user came
// from, and a login only ever UPDATES it - nothing but register creates it.
// Moving the provisioning out to the home SDK's provisioner must not take
// that write with it, so it lives here, in auth's flow, and the provisioner
// never has to know a local store exists. Which store, if any, is still the
// per-shell choice ./tenant-link.ts makes (ROKCT_TENANT_LINK, or a
// registered link): the "database" default inserts the row, the
// "single-tenant" built-in makes it a no-op. Exactly the 1.6.0 condition,
// which is to say none here.
//
// The loader is a parameter rather than an import so this module stays pure
// (a plain node test runs a staged copy); ./actions.ts passes loadTenantLink.

import type { RegisterOutcome, RegisterSubmission } from "./register-provision";
import type { TenantLink, TenantLinkRegistration } from "./tenant-link";

/** What the local link needs of a submission: everything but the password. */
export type RegisteredAccount = Omit<RegisterSubmission, "password">;

/** A successful outcome, as the provisioner answered it. */
export type RegisterSuccess = Extract<RegisterOutcome, { status: "success" }>;

/** The one operation this step needs of a tenant link. */
export type RegistrationLinker = Pick<TenantLink, "linkRegistration">;

/**
 * The site the local row records for a new account: the site the
 * provisioner says the account lives on, else the tenant site the request
 * came from (the `site_name` on the form or the resolved tenant host),
 * else null - the storefront, where a later login resolves it.
 */
export function registrationSite(
  account: RegisteredAccount,
  outcome: RegisterSuccess,
): string | null {
  return outcome.siteName ?? account.tenantSite ?? null;
}

/**
 * The onboarding record 1.6.0 stored beside the site, in the same shape:
 * the full name from the account fields; company, location and industry
 * from the home SDK's own fields when its config declared them (they were
 * this form's own until 1.7.0), null when it did not.
 */
export function onboardingDataFor(account: RegisteredAccount) {
  const fullName = `${account.firstName} ${account.lastName}`;
  const value = (name: string): string | null => {
    const raw = account.values[name];
    return typeof raw === "string" && raw.trim() ? raw : null;
  };
  const companyName = value("company_name");
  const country = value("country");
  return {
    user_fullname: fullName,
    company_name: companyName,
    location: country,
    industry: value("industry"),
    full_name: fullName,
    trading_name: companyName,
    primary_base: country,
  };
}

/** The registration the local link is asked to record. */
export function registrationLink(
  account: RegisteredAccount,
  outcome: RegisterSuccess,
): TenantLinkRegistration {
  return {
    siteName: registrationSite(account, outcome),
    onboardingData: onboardingDataFor(account),
  };
}

/**
 * Write the local user row for a provisioned account through the shell's
 * tenant link. Unconditional, as in 1.6.0: whether anything is written is
 * the link's decision, and a failure here is the caller's to report the way
 * it always did (register() answers "Could not create user.").
 */
export async function linkRegisteredAccount(
  account: RegisteredAccount,
  outcome: RegisterSuccess,
  load: () => Promise<RegistrationLinker>,
): Promise<void> {
  const link = await load();
  await link.linkRegistration(account.email, registrationLink(account, outcome));
}
