import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import { AI_MODELS } from "@/ai/models";
import Credentials from "next-auth/providers/credentials";

import { db } from "@/db";
import { user, globalSettings } from "@/db/schema";

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


          let isPaaSLogin = credentials?.is_paas === 'true';

          if (siteName && !isPaaSLogin) {
            // Ensure protocol is present for the URL construction
            baseUrl = siteName.startsWith('http') ? siteName : `https://${siteName}`;
          } else {
            if (dbUser.length > 0 && dbUser[0].siteName && !isPaaSLogin) {
              siteName = dbUser[0].siteName;
              baseUrl = siteName.startsWith('http') ? siteName : `https://${siteName}`;
            }
          }

          if (!baseUrl) throw new Error("ROKCT_BASE_URL is not set and no site found for user.");

          // 2. Login to Frappe
          let loginRes;


          let apiKey = null;
          let apiSecret = null;
          let name = "";
          let isOnboarded = false; // Add variable initialization
          let roles: string[] = [];

          // Default Home Page is Chat ("/")
          // This will be overridden based on Subscription modules below.
          let homePage = "/"; // Original line 55

          if (isPaaSLogin) {
            // PaaS Login (via paas-login.tsx)
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
            // Standard Login (via /login): Use New Global Auth API with VERBOSE LOGGING
            try {
              const targetUrl = `${baseUrl}/api/method/core.api.auth.login`;
              console.log(`[Auth] Attempting login to: ${targetUrl} for ${email}`);

              loginRes = await fetch(targetUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json"
                },
                body: JSON.stringify({ usr: email, pwd: password }),
              });
              console.log(`[Auth] Login Fetch Completed. Status: ${loginRes.status}`);

            } catch (e) {
              console.warn("[Auth] Standard Login connection failed", e);
              loginRes = { ok: false, status: 0, text: async () => "" } as any;
            }
          }

          // Process Initial Response
          let responseData = null;
          let isSuccess = false;

          if (loginRes && loginRes.ok) {
            try {
              // DEBUG: Get raw text to see if it's HTML or JSON
              const rawBody = await loginRes.text();
              console.log(`[Auth] Raw Response Body: ${rawBody.substring(0, 500)}...`);

              try {
                responseData = JSON.parse(rawBody);
                const msg = responseData.message || responseData;
                isSuccess = msg.status === true || msg === "Logged In";
                console.log(`[Auth] Parsed JSON. Success=${isSuccess}, Msg=${JSON.stringify(msg)}`);
              } catch (jsonErr) {
                console.error("[Auth] JSON Parse Error (Response might be HTML):", jsonErr);
              }
            } catch (e) {
              console.error("[Auth] Failed to read response text", e);
            }
          } else {
            console.log(`[Auth] Login Response not OK. Status: ${loginRes ? loginRes.status : 'Unknown'}`);
          }

          // FALLBACK LOGIC: Retry with Platform URL if initial attempt failed (HTTP or Logic)
          const platformUrl = process.env.ROKCT_BASE_URL;

          if (!isSuccess && baseUrl !== platformUrl && !isPaaSLogin) {
            console.log(`[Auth] Login to ${baseUrl} failed (Status: ${loginRes.status}, Success: ${isSuccess}). Retrying with Platform URL: ${platformUrl}`);

            try {
              baseUrl = platformUrl; // Update context
              loginRes = await fetch(`${platformUrl}/api/method/core.api.auth.login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usr: email, pwd: password }),
              });

              if (loginRes.ok) {
                responseData = await loginRes.json();
                const msg = responseData.message || responseData;
                isSuccess = msg.status === true || msg === "Logged In";
              }
            } catch (e) {
              console.warn("Platform Fallback Login fetch failed", e);
            }
          }

          // Bypass for Onboarding (Tenant Provisioning Phase)
          if (credentials?.is_onboarding === "true") {
            if (dbUser.length > 0) {
              // User is in local DB (just registered), but Site not ready.
              // Allow provisional login to access Waiting Room.
              console.log(`[Auth] Onboarding Login Bypass for ${email}`);
              return {
                id: email as string,
                email: email as string,
                name: (email as string).split("@")[0],
                homePage: "/paas",
                siteName: siteName || dbUser[0].siteName,
                roles: ["Onboarding"], // Special role
                isPaaS: true,
                isOnboarded: false,
                status: "Provisioning",
                // Empty keys
                apiKey: null,
                apiSecret: null
              };
            }
          }

          if (!loginRes || !loginRes.ok || !responseData) return null;

          const result = responseData.message || responseData;

          // Unified Response Handling
          if (result.status !== true) {
            console.log("[Auth] Final Login Decision: Failed", result);
            return null;
          }

          if (result.data && result.data.access_token) {
            [apiKey, apiSecret] = result.data.access_token.split(":");
          }
          if (result.data && result.data.user) {
            name = result.data.user.firstname || (email as string).split("@")[0];
            if (result.data.user.role) roles = [result.data.user.role];

            // EMERGENCY OVERRIDE: 
            // Ensure ray@rokct.ai is ALWAYS treated as System Manager to force Key Persistence
            if (email === "ray@rokct.ai" && !roles.includes("System Manager")) {
              roles.push("System Manager");
            }

            // FORCE NEXT.JS ROUTING:
            // If backend returns /app (Desk) or /me (Portal), we override it to "/" (Chat/App Home)
            let backendHome = result.data.user.home_page;
            if (backendHome === "/app" || backendHome === "/me") {
              homePage = "/";
            } else if (backendHome) {
              homePage = backendHome;
            }
          }

          // 2.2 Admin Key persistence (Control Site Only) & Platform Secret Generation
          // If this is a standard login and the user is an Admin, save keys to GlobalSettings
          let platformSecret = process.env.PLATFORM_SYNC_SECRET; // Default to env if set (legacy)

          try {
            const settings = await db.select().from(globalSettings).limit(1);
            let settingsId = null;

            if (settings.length > 0) {
              settingsId = settings[0].id;
              platformSecret = settings[0].platformSyncSecret || platformSecret;
            }

            // Generate Platform Secret if missing
            if (!platformSecret) {
              platformSecret = crypto.randomUUID();
              if (settingsId) {
                await db.update(globalSettings).set({ platformSyncSecret: platformSecret }).where(eq(globalSettings.id, settingsId));
              } else {
                await db.insert(globalSettings).values({ platformSyncSecret: platformSecret });
                // Re-fetch to get ID implies we just inserted, handled.
              }
            }

            // Persist Admin Keys Logic
            if (!isPaaSLogin && apiKey && apiSecret && (roles.includes("System Manager") || roles.includes("Administrator"))) {
              if (settings.length > 0) {
                await db.update(globalSettings).set({
                  adminApiKey: apiKey,
                  adminApiSecret: apiSecret,
                  platformSyncSecret: platformSecret // Ensure it's set
                }).where(eq(globalSettings.id, settings[0].id));
              } else {
                // Already handled insert above if missing, but if standard login was first...
                await db.insert(globalSettings).values({
                  adminApiKey: apiKey,
                  adminApiSecret: apiSecret,
                  isBetaMode: false,
                  platformSyncSecret: platformSecret
                });
              }
            }
          } catch (e) {
            console.error("Failed to persist Admin Keys/Secret", e);
          }

          // 2.3 Lazy Propagation of secret to Tenant Site
          // If a Tenant Admin logs in, push the secret to their site config
          if (isPaaSLogin && apiKey && apiSecret && platformSecret && roles.includes("System Manager")) {
            // Fire and Forget (don't block login)
            fetch(`${baseUrl}/api/method/rokct.rokct.tenant.api.set_platform_secret`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `token ${apiKey}:${apiSecret}`
              },
              body: JSON.stringify({ secret: platformSecret })
            }).catch(err => console.error("Failed to propagate platform secret", err));
          }

          // 2.5 Fetch Subscription Plan
          let plan = "Free";
          let status = "Free";
          let is_free_plan = 1;
          let is_ai = 1;
          let modules: string[] = [];
          let allowed_models: string[] = [];
          let subscriptionFetched = false;
          let companyContext: any = null;



          // Check if we are connected to the Platform (Waiting Room) or a real Tenant Site
          const isPlatformUrl = baseUrl === process.env.ROKCT_BASE_URL;

          if (isPaaSLogin && !isPlatformUrl) {
            try {
              const subRes = await fetch(`${baseUrl}/api/method/rokct.rokct.tenant.api.get_subscription_details`, {
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
                      plan = match[1] ? match[1].trim() : details.plan;
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
            // Standard Login (Control Site) OR Waiting Room
            try {
              const subRes = await fetch(`${process.env.ROKCT_BASE_URL}/api/method/rokct.control.api.get_my_subscription`, {
                method: "GET",
                headers: {
                  "Authorization": `token ${apiKey}:${apiSecret}`
                }
              });

              if (subRes.ok) {
                const subData = await subRes.json();
                if (subData.status === "success" && subData.message) {
                  const details = subData.message;
                  plan = details.plan;
                  status = details.status;
                  is_free_plan = details.is_free_plan;
                  is_ai = details.is_ai;
                  modules = details.modules || [];
                  subscriptionFetched = true;
                }
              }
            } catch (e) {
              console.warn("Failed to fetch control subscription", e);
            }
          }

          // 2.7 Fetch Company Context (Single Site Company)
          // We assume one company per site for this branding logic.
          if (apiKey && apiSecret && !isPaaSLogin && !isPlatformUrl) {
            try {
              const companyRes = await fetch(`${baseUrl}/api/method/frappe.client.get_list`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `token ${apiKey}:${apiSecret}`
                },
                body: JSON.stringify({
                  doctype: "Company",
                  fields: ["name", "country", "credit_provider_license", "tax_id", "default_currency", "company_name", "year_end_date"],
                  limit_page_length: 1
                })
              });

              if (companyRes.ok) {
                const companyData = await companyRes.json();
                const company = companyData.message?.[0];
                if (company) {
                  companyContext = {
                    name: company.name,
                    country: company.country,
                    countryCode: getCountryCode(company.country),
                    license: company.credit_provider_license,
                    taxId: company.tax_id,
                    currency: company.default_currency,
                    companyName: company.company_name,
                    yearEndDate: company.year_end_date
                  };
                }
              }
            } catch (e) {
              console.warn("Failed to fetch company context", e);
            }
          }

          // 2.6 Fallback / Admin Logic (Must run BEFORE routing logic)
          if (!subscriptionFetched) {
            if (roles.includes("System Manager") || roles.includes("Administrator")) {
              // Control Panel Admin / System Manager on non-tenant site -> Grant Ultra access + All Modules
              plan = "Ultra";
              status = "Active";
              is_free_plan = 0;
              is_ai = 1;
              modules = ["Hosting", "RPanel", "PaaS", "Lending"]; // Admin gets everything
              subscriptionFetched = true;
            }
          }

          // 2.7 Determine Home Page based on Subscription Modules
          if (subscriptionFetched) {
            if (modules.includes("Hosting") || modules.includes("RPanel")) {
              homePage = "/handson/control/rpanel";
            } else if (modules.includes("PaaS")) {
              homePage = "/paas";
            }
          }

          // Derive allowed_models for frontend compatibility
          if (is_ai) {
            // dynamic import would be better but for now use string literals matching AI_MODELS
            // or we could import AI_MODELS at top level.
            allowed_models.push(AI_MODELS.FREE.id);
            if (!is_free_plan && (status === "Active" || status === "Trialing")) {
              allowed_models.push(AI_MODELS.PAID.id);
            }
          }

          // 3. Update User in DB with latest keys and site (Persistence)
          if (dbUser.length > 0) {
            await db.update(user).set({
              apiKey: apiKey,
              apiSecret: apiSecret,
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
            allowed_models: allowed_models,
            isOnboarded: isOnboarded,
            location: dbUser.length > 0 ? dbUser[0].location : null,
            company: companyContext
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
        token.isOnboarded = (user as any).isOnboarded;
        token.location = (user as any).location;
        token.company = (user as any).company;
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
        (session.user as any).isOnboarded = token.isOnboarded;
        (session.user as any).location = token.location;
        (session.user as any).company = token.company;
      }
      return session;
    }
  }
});

// Helper to map country name to ISO code
function getCountryCode(countryName: string): string {
  if (!countryName) return "";
  const name = countryName.toLowerCase();
  if (name.includes("south africa")) return "za";
  if (name.includes("united states") || name.includes("usa")) return "us";
  if (name.includes("united kingdom") || name.includes("uk")) return "uk";
  if (name.includes("india")) return "in";
  // Add more as needed, fallback to first 2 chars if standard
  return name.substring(0, 2);
}
