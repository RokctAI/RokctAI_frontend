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
// The register route (auth_sdk 1.7.0): offered or not is the home SDK's
// call. The register config (components/custom/auth/register-registry.ts)
// is read here, on the server, and a config that switches register off
// sends the visitor to the login - the same destination a tenant host's
// /register is redirected to by middleware.ts (app/(auth)/tenant-host.ts
// TENANT_LOGIN_PATH). Otherwise the page is register-view.tsx with the
// config's words and fields, server-rendered as ordinary HTML.

import { redirect } from "next/navigation";

import { TENANT_LOGIN_PATH } from "@/app/(auth)/tenant-host";
import {
  loadRegisterConfig,
  serialisableFields,
} from "@/components/custom/auth/register-registry";

import { RegisterView } from "./register-view";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const config = await loadRegisterConfig();
  if (!config.enabled) redirect(TENANT_LOGIN_PATH);

  const params = await searchParams;
  const prefilled: Record<string, string | null> = {};
  for (const field of config.fields) {
    if (!field.fromQuery) continue;
    const raw = params[field.fromQuery];
    const value = Array.isArray(raw) ? raw[0] : raw;
    prefilled[field.name] = value?.trim() || null;
  }

  return (
    <RegisterView
      copy={config.copy}
      fields={serialisableFields(config.fields)}
      hasSteps={config.steps.length > 0}
      prefilled={prefilled}
    />
  );
}
