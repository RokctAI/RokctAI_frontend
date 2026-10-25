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

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import {
  PlatformGatewayError,
  platformCall,
} from "@/app/services/base/platform-gateway";

import { authConfig } from "./auth.config";
import { loadTenantLink, type TenantLinkRecord } from "./tenant-link";

/** Minimum gap between subscription re-checks for a pending session. */
const SUBSCRIPTION_RETRY_MS = 60_000;
/** The longest a session read waits on the subscription re-check. */
const SUBSCRIPTION_CALL_TIMEOUT_MS = 5_000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials;
        try {
          // 1. Determine Base URL
          let baseUrl = process.env.ROKCT_BASE_URL;
          let siteName = (credentials?.site_name as string) || null;

          // Where this email's site comes from when the form named none is
          // the host's choice, not this file's: ./tenant-link.ts resolves it
          // through the first registered TenantLink, and its default is the
          // same drizzle lookup this block used to do inline (we need the
          // record later anyway, to decide whether there is anything to
          // remember the login against).
          const tenantLink = await loadTenantLink();
          // The link is a convenience: it remembers which site an email signed
          // in against. A lookup that fails (no POSTGRES_URL, database down)
          // must not decide the login. Log it and let the backend answer.
          let link: TenantLinkRecord | null = null;
          let linkLookupFailed = false;
          try {
            link = await tenantLink.resolveLink(email as string);
          } catch (linkError) {
            linkLookupFailed = true;
            console.error(
              "[auth] tenant link lookup failed:",
              linkError,
            );
          }
          // With the lookup down and no site named, the default backend is a
          // guess: on a multi-tenant host it may not be this user's tenant.
          // Refuse rather than sign into the wrong site. A single-tenant host
          // has no lookup to fail (ROKCT_TENANT_LINK=single-tenant).
          if (linkLookupFailed && !siteName) return null;

          if (siteName) {
            // Ensure protocol is present for the URL construction
            baseUrl = siteName.startsWith("http")
              ? siteName
              : `https://${siteName}`;
          } else {
            if (link && link.siteName) {
              siteName = link.siteName;
              baseUrl = siteName.startsWith("http")
                ? siteName
                : `https://${siteName}`;
            }
          }

          if (!baseUrl)
            throw new Error(
              "ROKCT_BASE_URL is not set and no site found for user.",
            );

          // 2. Login to Frappe
          let loginRes;
          let responseData: any;
          // Always-paas collapse for the deliveryplatform shell: every login
          // is a PaaS tenant login regardless of which form submitted it. The
          // non-paas branches below are kept verbatim from the source but are
          // unreachable here.
          let isPaaSLogin = true;

          if (isPaaSLogin) {
            // PaaS Login (via paas-login.tsx): Try Custom API first (for API
            // Keys). Rides the universal platform gateway with the
            // prefix-free cmd for the users manifest's
            // `{app_name}.api.user.login` whitelisted_methods key, through
            // the base kernel client: `requireAuth: false` and `session:
            // null` because there is no session yet (this IS the login) and
            // the explicit `baseUrl` keeps the call free of request-scope
            // reads; `throwOnError` so a failed call is told apart from a
            // rejected login the same way the raw fetch did (a non-2xx or a
            // connection failure both end in `return null`).
            try {
              responseData = await platformCall<any>(
                "api.user.login",
                { usr: email, pwd: password },
                {
                  baseUrl,
                  session: null,
                  requireAuth: false,
                  throwOnError: true,
                },
              );
            } catch (e) {
              if (
                e instanceof PlatformGatewayError &&
                e.reason === "network_error"
              ) {
                console.warn("PaaS Login connection failed", e);
              }
              return null;
            }
          } else {
            // Standard Login (via /login): Use Standard API
            // bypasses gateway: needs the Frappe sid Set-Cookie from native /api/method/login (read below for control:get_my_subscription); platformCall returns only the body and api.user.login issues API keys, not a sid.
            loginRes = await fetch(`${baseUrl}/api/method/login`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ usr: email, pwd: password }),
            });

            if (!loginRes.ok) return null;

            responseData = await loginRes.json();
          }

          // Handle different response structures
          let authData: any = {};
          let apiKey = null;
          let apiSecret = null;
          let refreshToken: string | null = null;
          let roles: string[] = [];
          let name = "";
          let homePage = "/"; // Default to root (Chat)

          if (isPaaSLogin) {
            // api.user.login answers through api_response: HTTP 200 with
            // { data, message: "Logged In", status_code } -- there is no
            // `status` flag, and `message` is a plain string (platformCall
            // already unwrapped Frappe's own `message` envelope). A rejected
            // login carries status_code 401/403 and no data.
            const result = responseData || {};
            const code = Number(result.status_code ?? 200);
            if (code >= 400 || !result.data?.access_token) return null;

            authData = result.data;
            if (authData.access_token) {
              [apiKey, apiSecret] = authData.access_token.split(":");
            }
            // Kept so refreshTokens() (actions.ts) can renew the session.
            refreshToken = authData.refresh_token || null;
            if (authData.user) {
              name = authData.user.firstname || (email as string).split("@")[0];
              if (authData.user.role) roles = [authData.user.role];
              if (authData.user.home_page) homePage = authData.user.home_page;
            }
          } else {
            // Standard Login Response: { message: "Logged In", full_name: "...", home_page: "..." }
            if (responseData.message !== "Logged In") return null;

            name = responseData.full_name || (email as string).split("@")[0];
            if (responseData.home_page) homePage = responseData.home_page;
          }

          // 2.5 Fetch Subscription Plan
          let plan = "Free";
          let status = "Free";
          let is_free_plan = 1;
          let is_ai = 1;
          let modules: string[] = [];
          let allowed_models: string[] = [];
          let subscriptionFetched = false;
          // True when the PaaS subscription call did not answer. The defaults
          // above (Free, no modules) stand until the jwt callback gets an answer.
          let subscriptionPending = false;

          if (isPaaSLogin) {
            try {
              // Universal gateway call — cmd is the prefix-free tenant
              // manifest key (never per-method URLs, never app-prefixed).
              const details = await platformCall<any>(
                "tenant.api.get_subscription_details",
                undefined,
                {
                  baseUrl,
                  headers: {
                    Authorization: `token ${apiKey}:${apiSecret}`,
                  },
                },
              );
              if (details) {
                if (details.plan) {
                  const match = details.plan.match(/^([^\(]+)/);
                  if (match) {
                    plan = match[1].trim();
                  } else {
                    plan = details.plan;
                  }
                }
                if (details.status) status = details.status;
                if (details.is_free_plan !== undefined)
                  is_free_plan = details.is_free_plan;
                if (details.is_ai !== undefined) is_ai = details.is_ai;
                if (details.modules) modules = details.modules;
                subscriptionFetched = true;
              }
            } catch (e) {
              console.warn("Failed to fetch subscription details", e);
            }
          } else {
            // NEW: Standard Login (Control Site) - Check for Hosting Client / SaaS Sub
            try {
              const cookie = loginRes?.headers.get("set-cookie");
              // Universal gateway call — the control gateway only serves
              // `control:`-prefixed cmds; this is the subscriptions
              // manifest's `control:get_my_subscription` key.
              const subData = await platformCall<any>(
                "control:get_my_subscription",
                undefined,
                {
                  baseUrl,
                  // GET keeps the cookie-authenticated call free of
                  // frappe's CSRF check on POSTs.
                  method: "GET",
                  headers: {
                    Cookie: cookie || "",
                  },
                },
              );

              if (subData) {
                // Only update if we actually found a subscription
                if (subData.status === "success" && subData.message) {
                  const details = subData.message;
                  plan = details.plan;
                  status = details.status;
                  is_free_plan = details.is_free_plan;
                  is_ai = details.is_ai; // Will be 0 for RPanel users
                  modules = details.modules || [];
                  subscriptionFetched = true;
                }
              }
            } catch (e) {
              console.warn("Failed to fetch control subscription", e);
            }
          }

          if (isPaaSLogin && !subscriptionFetched) subscriptionPending = true;

          // Fallback / Admin Logic
          if (!subscriptionFetched) {
            if (
              roles.includes("System Manager") ||
              roles.includes("Administrator")
            ) {
              // Control Panel Admin / System Manager on non-tenant site -> Grant Ultra
              plan = "Ultra";
              status = "Active";
              is_free_plan = 0;
              is_ai = 1;
            }
          }

          // Derive allowed_models for frontend compatibility (runs for both fetched and fallback data)
          if (is_ai) {
            allowed_models.push("Gemini Flash");
            if (
              !is_free_plan &&
              (status === "Active" || status === "Trialing")
            ) {
              allowed_models.push("Gemini Pro");
            }
          }

          // 3. Remember the latest keys and site against the resolved link
          // (Persistence). Still conditional on a record existing, for the
          // same reason the drizzle version was: a login never creates one.
          if (link) {
            try {
              await tenantLink.rememberLogin(email as string, {
                apiKey: apiKey, // Might be null for tenants
                apiSecret: apiSecret, // Might be null for tenants
                siteName: siteName || new URL(baseUrl).hostname,
              });
            } catch (rememberError) {
              // The login itself succeeded; only the saved link is lost.
              console.error("[auth] could not remember login:", rememberError);
            }
          }

          // 5. Return User Details
          // Note: These fields are transient and not persisted to the DB
          return {
            id: email as string,
            email: email as string,
            name: name,
            apiKey: apiKey,
            apiSecret: apiSecret,
            refreshToken: refreshToken,
            homePage: homePage,
            siteName: siteName || new URL(baseUrl).hostname,
            roles: roles,
            isPaaS: isPaaSLogin,
            plan: plan,
            status: status,
            is_free_plan: is_free_plan,
            is_ai: is_ai,
            modules: modules,
            allowed_models: allowed_models,
            subscriptionPending: subscriptionPending,
          };
        } catch (e) {
          console.error("Frappe Login Error:", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // A login whose subscription call failed carries the Free defaults
      // (see authorize). Re-ask the backend here, at most once a minute, so
      // a transient outage does not leave the paid plan withheld for the
      // whole session.
      if (
        !user &&
        token.subscriptionPending &&
        token.apiKey &&
        token.apiSecret &&
        token.siteName &&
        Date.now() - Number(token.subscriptionCheckedAt ?? 0) >=
          SUBSCRIPTION_RETRY_MS
      ) {
        token.subscriptionCheckedAt = Date.now();
        try {
          const site = String(token.siteName);
          const baseUrl = site.startsWith("http") ? site : `https://${site}`;
          // session: null - this runs inside the session callback, so the
          // gateway must not resolve the session again (that would re-enter
          // this callback). The explicit Authorization header is the credential.
          // Capped: this runs while a session is being read, so a slow backend
          // must not hold that request. On timeout the defaults stand and the
          // next check is a minute away.
          let timer: ReturnType<typeof setTimeout> | undefined;
          const details = await Promise.race([
            platformCall<any>("tenant.api.get_subscription_details", undefined, {
              baseUrl,
              session: null,
              requireAuth: false,
              headers: {
                Authorization: `token ${token.apiKey}:${token.apiSecret}`,
              },
            }),
            new Promise<never>((_, reject) => {
              timer = setTimeout(
                () => reject(new Error("subscription refresh timed out")),
                SUBSCRIPTION_CALL_TIMEOUT_MS,
              );
            }),
          ]).finally(() => clearTimeout(timer));
          if (details) {
            const match = details.plan
              ? String(details.plan).match(/^([^\(]+)/)
              : null;
            token.plan = match ? match[1].trim() : details.plan || "Free";
            token.status = details.status || "Free";
            token.is_free_plan =
              details.is_free_plan !== undefined ? details.is_free_plan : 1;
            token.is_ai = details.is_ai !== undefined ? details.is_ai : 1;
            token.modules = details.modules || [];
            token.subscriptionPending = false;
          }
        } catch (e) {
          console.warn("Subscription refresh failed; keeping Free until it succeeds", e);
        }
      }
      if (user) {
        token.subscriptionPending = (user as any).subscriptionPending ?? false;
        token.subscriptionCheckedAt = token.subscriptionPending ? Date.now() : 0;
        token.id = user.id;
        token.apiKey = (user as any).apiKey;
        token.apiSecret = (user as any).apiSecret;
        token.refreshToken = (user as any).refreshToken;
        token.roles = (user as any).roles;
        token.siteName = (user as any).siteName;
        token.isPaaS = (user as any).isPaaS;
        token.homePage = (user as any).homePage;
        token.plan = (user as any).plan;
        token.status = (user as any).status;
        token.is_free_plan = (user as any).is_free_plan;
        token.is_ai = (user as any).is_ai;
        token.modules = (user as any).modules;
        token.allowed_models = (user as any).allowed_models;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        (session.user as any).apiKey = token.apiKey;
        (session.user as any).apiSecret = token.apiSecret;
        (session.user as any).refreshToken = token.refreshToken;
        (session.user as any).roles = token.roles;
        (session.user as any).siteName = token.siteName;
        (session.user as any).isPaaS = token.isPaaS;
        (session.user as any).homePage = token.homePage;
        (session.user as any).plan = token.plan;
        (session.user as any).status = token.status;
        (session.user as any).is_free_plan = token.is_free_plan;
        (session.user as any).is_ai = token.is_ai;
        (session.user as any).modules = token.modules;
        (session.user as any).allowed_models = token.allowed_models;
      }
      return session;
    },
  },
});
