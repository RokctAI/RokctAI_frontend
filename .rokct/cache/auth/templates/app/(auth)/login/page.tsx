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
// The login route (auth_sdk 1.7.0): ONE path, two forms.
//
// On the storefront this is the platform's own sign-in (login-view.tsx,
// the client page this file used to be). On a tenant's domain - a host
// base_sdk's control lookup resolved and middleware.ts forwarded as the
// `x-rokct-tenant-site` header - and on an explicit `?site_name=` link, it
// is the tenant portal login (components/custom/paas-login.tsx), which
// signs in against that site and only that site. The query parameter wins
// when both are present. Nothing here ever signs a visitor in against the
// control site: without a resolved site there is no portal.

import { headers } from "next/headers";

import { resolveTenantSite } from "@/app/(auth)/tenant-host";
import { TENANT_SITE_HEADER } from "@/app/services/base/tenant-host-control";
import { PaaSLogin } from "@/components/custom/paas-login";

import { LoginView } from "./login-view";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tenantSite = resolveTenantSite(
    params.site_name,
    (await headers()).get(TENANT_SITE_HEADER),
  );
  if (tenantSite) return <PaaSLogin tenantSite={tenantSite} />;
  return <LoginView />;
}
