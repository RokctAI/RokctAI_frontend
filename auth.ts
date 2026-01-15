import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { db } from "@/db";
import { user } from "@/db/schema";

import { authConfig } from "./auth.config";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials;
        try {
          // 1. Determine Base URL
          let baseUrl = process.env.ROKCT_BASE_URL;
          let siteName = (credentials?.site_name as string) || null;

          // Check DB for stored site_name (we need dbUser later anyway)
          const dbUser = await db.select().from(user).where(eq(user.email, email as string)).limit(1);

          if (siteName) {
            // Ensure protocol is present for the URL construction
            baseUrl = siteName.startsWith('http') ? siteName : `https://${siteName}`;
          } else {
            if (dbUser.length > 0 && dbUser[0].siteName) {
              siteName = dbUser[0].siteName;
              baseUrl = siteName.startsWith('http') ? siteName : `https://${siteName}`;
            }
          }

          if (!baseUrl) throw new Error("ROKCT_BASE_URL is not set and no site found for user.");

          // 2. Login to Frappe
          let loginRes;
          let isPaaSLogin = credentials?.is_paas === 'true';

          if (isPaaSLogin) {
            // PaaS Login (via paas-login.tsx): Try Custom API first (for API Keys)
            try {
              loginRes = await fetch(`${baseUrl}/api/method/paas.api.user.login`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ usr: email, pwd: password }),
              });
            } catch (e) {
              console.warn("PaaS Login connection failed", e);
              loginRes = { ok: false } as Response;
            }
          } else {
            // Standard Login (via /login): Use Standard API
            loginRes = await fetch(`${baseUrl}/api/method/login`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ usr: email, pwd: password }),
            });
          }

          if (!loginRes.ok) return null;

          const responseData = await loginRes.json();

          // Handle different response structures
          let authData: any = {};
          let apiKey = null;
          let apiSecret = null;
          let roles: string[] = [];
          let name = "";
          let homePage = "/"; // Default to root (Chat)

          if (isPaaSLogin) {
            const result = responseData.message || responseData;
            if (result.status !== true) return null;

            authData = result.data;
            if (authData.access_token) {
              [apiKey, apiSecret] = authData.access_token.split(":");
            }
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

          if (isPaaSLogin) {
            try {
              const subRes = await fetch(`${baseUrl}/api/method/core.tenant.api.get_subscription_details`, {
                method: "GET",
                headers: {
                  "Authorization": `token ${apiKey}:${apiSecret}`
                }
              });
              if (subRes.ok) {
                const subData = await subRes.json();
                const details = subData.message;
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
                  if (details.is_free_plan !== undefined) is_free_plan = details.is_free_plan;
                  if (details.is_ai !== undefined) is_ai = details.is_ai;
                  if (details.modules) modules = details.modules;
                  subscriptionFetched = true;
                }
              }
            } catch (e) {
              console.warn("Failed to fetch subscription details", e);
            }
          } else {
            // NEW: Standard Login (Control Site) - Check for Hosting Client / SaaS Sub
            try {
              const cookie = loginRes.headers.get("set-cookie");
              const subRes = await fetch(`${baseUrl}/api/method/control.control.api.subscription.get_my_subscription`, {
                method: "GET",
                headers: {
                  "Cookie": cookie || ""
                }
              });

              if (subRes.ok) {
                const subData = await subRes.json();
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

          // Fallback / Admin Logic
          if (!subscriptionFetched) {
            if (roles.includes("System Manager") || roles.includes("Administrator")) {
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
            if (!is_free_plan && (status === "Active" || status === "Trialing")) {
              allowed_models.push("Gemini Pro");
            }
          }

          // 3. Update User in DB with latest keys and site (Persistence)
          if (dbUser.length > 0) {
            await db.update(user).set({
              apiKey: apiKey, // Might be null for tenants
              apiSecret: apiSecret, // Might be null for tenants
              siteName: siteName || new URL(baseUrl).hostname
            }).where(eq(user.email, email as string));
          }

          // 5. Return User Details
          // Note: These fields are transient and not persisted to the DB
          return {
            id: email as string,
            email: email as string,
            name: name,
            apiKey: apiKey,
            apiSecret: apiSecret,
            homePage: homePage,
            siteName: siteName || new URL(baseUrl).hostname,
            roles: roles,
            isPaaS: isPaaSLogin,
            plan: plan,
            status: status,
            is_free_plan: is_free_plan,
            is_ai: is_ai,
            modules: modules,
            allowed_models: allowed_models
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
      if (user) {
        token.id = user.id;
        token.apiKey = (user as any).apiKey;
        token.apiSecret = (user as any).apiSecret;
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
    }
  }
});