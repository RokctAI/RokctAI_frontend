"use server";

import { AuthError } from "next-auth";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user, globalSettings } from "@/db/schema";
import { signIn, auth } from "./auth";

export async function getCurrentSession() {
  return await auth();
}

export type ActionState = {
  error?: string;
  status?: "idle" | "success" | "failed" | "invalid_data" | "user_exists";
};

export async function login(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await signIn("credentials", {
      ...Object.fromEntries(formData),
      is_paas: formData.get("is_paas"), // Pass the flag explicitly
      redirect: false,
    });
    return { status: "success" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { status: "failed", error: "Invalid credentials." };
        default:
          return { status: "failed", error: "Something went wrong." };
      }
    }
    throw error;
  }
}

export async function register(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const companyName = formData.get("company_name") as string;
  const firstName = formData.get("first_name") as string;
  const lastName = formData.get("last_name") as string;
  const industry = formData.get("industry") as string;
  const voucherCode = formData.get("voucher_code") as string | null;
  const isServicePlan = formData.get("is_service_plan") === "on";

  const plan = formData.get("plan") as string;
  const countryInput = (formData.get("country") as string) || "South Africa";

  // Resolve Currency from Country (via Control Site API)
  let currency = "USD"; // Default
  let country = countryInput; // Default to input

  try {
    const baseUrl = process.env.ROKCT_BASE_URL;
    if (baseUrl) {
      // Resolve from Country Name (Dynamic based on form input)
      const pricingRes = await fetch(`${baseUrl}/api/method/rokct.control.api.subscription.get_pricing_metadata?country=${encodeURIComponent(countryInput)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (pricingRes.ok) {
        const pricingData = await pricingRes.json();
        const data = pricingData.message;
        if (data) {
          if (data.currency) currency = data.currency;
          if (data.country_name) country = data.country_name; // Normalize Country Name
        }
      }
    }
  } catch (err) {
    console.warn("Failed to resolve currency from country:", err);
  }

  try {
    const baseUrl = process.env.ROKCT_BASE_URL;
    if (!baseUrl) throw new Error("ROKCT_BASE_URL is not set");

    // Retrieve Admin Keys from GlobalSettings (set via Admin Login)
    const settings = await db.select().from(globalSettings).limit(1);
    const adminKey = settings.length > 0 ? settings[0].adminApiKey : null;
    const adminSecret = settings.length > 0 ? settings[0].adminApiSecret : null;

    if (!adminKey || !adminSecret) {
      return { status: "failed", error: "System not initialized. Administrator must login first." };
    }

    // 2. Provisioning handles User Creation (Service) or Site Setup (Tenant)
    let siteName = null;

    if (companyName) {
      try {
        if (isServicePlan) { // Method 1: Service Provisioning (Creates Control Plane User)
          const provisionRes = await fetch(`${baseUrl}/api/v1/method/rokct.control.provisioning.provision_service_subscription`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `token ${adminKey}:${adminSecret}`
            },
            body: JSON.stringify({
              plan: plan,
              email: email,
              password: password,
              first_name: firstName,
              last_name: lastName,
              company_name: companyName,
              currency: currency,
              country: country,
              industry: industry,
              voucher_code: voucherCode,
              domain: formData.get("domain") ? (formData.get("domain") as string) : null,
              lines: 1
            })
          });

          if (provisionRes.ok) {
            const provisionData = await provisionRes.json();
            siteName = provisionData.message?.site_name || provisionData.message;
          } else {
            // Handle Error
            const err = await provisionRes.json();
            return { status: "failed", error: err.message || "Service Provisioning failed" };
          }

        } else { // Method 2: Tenant Provisioning (Queues Site, User NOT created on Control Plane)
          const provisionRes = await fetch(`${baseUrl}/api/v1/method/rokct.control.provisioning.provision_new_tenant`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `token ${adminKey}:${adminSecret}`
            },
            body: JSON.stringify({
              email: email,
              company_name: companyName,
              plan: plan,
              first_name: firstName,
              last_name: lastName,
              currency: currency,
              country: country,
              industry: industry,
              voucher_code: voucherCode
            })
          });

          if (provisionRes.ok) {
            const provisionData = await provisionRes.json();
            siteName = provisionData.message?.site_name || provisionData.message;
          } else {
            // Handle Error
            try {
              const err = await provisionRes.json();
              return { status: "failed", error: err.message || "Tenant Provisioning failed" };
            } catch (e) {
              return { status: "failed", error: "Provisioning connection failed" };
            }
          }
        }
      } catch (e) {
        console.error("Provisioning Error:", e);
        return { status: "failed", error: "Provisioning exception occurred." };
      }
    }

    // 3. Save User to Local DB (Persistence)
    const existingUser = await db.select().from(user).where(eq(user.email, email)).limit(1);

    if (existingUser.length === 0) {
      await db.insert(user).values({
        email: email,
        siteName: siteName
      });
    } else if (siteName) {
      await db.update(user).set({ siteName: siteName }).where(eq(user.email, email));
    }

    // 4. Auto-Login
    try {
      // Fetch Plan Details to check for AI capability
      let isAiPlan = false;
      const plansRes = await getSubscriptionPlans();
      if (plansRes.success && plansRes.data) {
        const p = plansRes.data.find((x: any) => x.plan_name === plan);
        if (p && p.is_ai === 1) isAiPlan = true;
      }

      // Determine Login Mode
      // Service Plans -> Normal PaaS Login (User exists on Control Plane)
      // Tenant Plans which are AI -> Onboarding Login (User exists in DB only, bypass auth)
      // Tenant Plans (Non-AI) -> No Login (Wait for email)

      const loginParams: any = {
        email: email,
        password: password,
        redirect: false,
        is_paas: "true"
      };

      let shouldLogin = true;

      if (!isServicePlan) {
        if (isAiPlan) {
          loginParams.is_onboarding = "true";
        } else {
          // Non-AI Tenant Plan: User cannot login yet (Site not ready, no onboarding)
          shouldLogin = false;
        }
      }

      if (shouldLogin) {
        await signIn("credentials", loginParams);
      } else {
        // Return success but user is not logged in. 
        // They will be redirected to login page usually, or we can show a specific message?
        // The form expects { status: "success" }.
        // The UI might redirect to /login or show "Check your email".
      }

    } catch (loginError) {
      console.warn("Auto-login failed:", loginError);
      // Fallback: If login fails, we still return success for registration.
    }

    return { status: "success" };
  } catch (error) {
    console.error("Registration Error:", error);
    return { status: "failed", error: "Could not create user." };
  }
}

export async function getIndustries(): Promise<string[]> {
  try {
    const baseUrl = process.env.ROKCT_BASE_URL;
    if (!baseUrl) return [];

    // Retrieve Admin Keys
    const settings = await db.select().from(globalSettings).limit(1);
    const adminKey = settings.length > 0 ? settings[0].adminApiKey : null;
    const adminSecret = settings.length > 0 ? settings[0].adminApiSecret : null;

    if (!adminKey || !adminSecret) return [];

    const res = await fetch(`${baseUrl}/api/method/frappe.client.get_list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `token ${adminKey}:${adminSecret}`
      },
      body: JSON.stringify({
        doctype: "Industry Type",
        fields: ["name"],
        limit_page_length: 100,
        order_by: "name asc"
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.message && Array.isArray(data.message)) {
        return data.message.map((item: any) => item.name);
      }
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch industries:", error);
    return [];
  }
}
