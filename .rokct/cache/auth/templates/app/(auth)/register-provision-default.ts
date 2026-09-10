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
// The default register provisioner (auth_sdk 1.7.0): a generic account on
// the tenant site the request is for, then a sign-in. What the Dart auth
// SDK's AuthRepository does for an app whose home SDK declares nothing:
// the platform's guest `api.user.register_user` (users_sdk's
// `{app_name}.api.user.register_user` key) with the account fields, on
// the site base_sdk resolves for this request - the tenant host's site when
// there is one, else the deployment's configured backend. Nothing is
// provisioned, nobody's administrator keys are involved, and the control
// site is never the target: a registration with no tenant to register on
// fails rather than creating an account at the control plane.

import {
  PlatformGatewayError,
  platformCall,
  resolveTenantBaseUrl,
} from "@/app/services/base/platform-gateway";
import { normalizeSiteUrl, sameSite } from "@/app/services/base/tenant-hosts";
import { controlBaseUrl } from "@/app/services/base/tenant-host-control";

import type {
  RegisterOutcome,
  RegisterProvisioner,
  RegisterSubmission,
} from "./register-provision";

/** The platform's guest sign-up cmd, prefix-free (a tenant manifest key). */
export const REGISTER_USER_CMD = "api.user.register_user";

/** Frappe's duplicate-account answer, as register_user words it. */
const USER_EXISTS_RE = /already (registered|exists)/i;

const defaultProvisioner: RegisterProvisioner = {
  async provision(submission: RegisterSubmission): Promise<RegisterOutcome> {
    const baseUrl =
      normalizeSiteUrl(submission.tenantSite) ??
      (await resolveTenantBaseUrl({ session: null }));
    if (!baseUrl) {
      return { status: "failed", error: "No site to register on." };
    }
    const control = controlBaseUrl();
    if (control && sameSite(baseUrl, control)) {
      return { status: "failed", error: "Registration is not offered here." };
    }

    try {
      const result = await platformCall<{
        status?: boolean | string;
        message?: string;
      }>(
        REGISTER_USER_CMD,
        {
          email: submission.email,
          password: submission.password,
          first_name: submission.firstName,
          last_name: submission.lastName,
        },
        { baseUrl, session: null, requireAuth: false, throwOnError: true },
      );
      const message = typeof result?.message === "string" ? result.message : "";
      if (result && result.status === false) {
        if (USER_EXISTS_RE.test(message)) return { status: "user_exists" };
        return { status: "failed", error: message || "Could not create account." };
      }
      return {
        status: "success",
        siteName: submission.tenantSite,
        signIn: {
          email: submission.email,
          password: submission.password,
          siteName: submission.tenantSite,
        },
        message: message || undefined,
      };
    } catch (e) {
      if (e instanceof PlatformGatewayError && e.reason === "http_error") {
        if (e.status === 409) return { status: "user_exists" };
        return { status: "failed", error: "Could not create account." };
      }
      console.error("[auth] register_user failed:", e);
      return { status: "failed", error: "Could not reach the site." };
    }
  },
};

export default defaultProvisioner;
