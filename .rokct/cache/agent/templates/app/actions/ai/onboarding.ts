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

"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/app/(auth)/auth";
import {
  PlatformGatewayError,
  platformCall,
} from "@/app/services/base/platform-gateway";

/**
 * Onboarding Data Structure
 * Based on API_GUIDE.md "Plan on a Page"
 */
export interface StrategicPlan {
  vision_title: string;
  vision_description: string;
  pillars: {
    title: string;
    description: string;
    objectives: {
      title: string;
      description: string;
      kpis: {
        title: string;
        description: string;
      }[];
    }[];
  }[];
}

/**
 * Saves the draft onboarding plan to the local database.
 * This is called by the AI during the "waiting period" while the site provisions.
 */
export async function saveOnboardingProgress(planData: Partial<StrategicPlan>) {
  const session = await auth();
  if (!session || !session.user || !session.user.email) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db
      .update(user)
      .set({ onboardingData: planData })
      .where(eq(user.email, session.user.email));

    return { success: true };
  } catch (e) {
    console.error("Failed to save onboarding progress", e);
    return { success: false, error: "Database error" };
  }
}

/**
 * Marks the onboarding as complete locally.
 * In a real flow, this would trigger the push to the Tenant Site.
 */
export async function completeOnboarding() {
  const session = await auth();
  if (!session || !session.user || !session.user.email) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db
      .update(user)
      .set({ isOnboarded: true })
      .where(eq(user.email, session.user.email));

    // Trigger the sync (Fire and Forget)
    // In reality, we might queue this or retry if the site is not ready yet.
    syncOnboardingToSite(session.user.email);

    return { success: true };
  } catch (e) {
    console.error("Failed to complete onboarding", e);
    return { success: false, error: "Database error" };
  }
}

export async function syncOnboardingToSite(userEmail: string) {
  console.log(`Syncing onboarding data for ${userEmail} to Tenant Site...`);

  // 1. Fetch user and their keys
  const dbUser = await db
    .select()
    .from(user)
    .where(eq(user.email, userEmail))
    .limit(1);
  const userData = dbUser[0];

  if (!userData || !userData.siteName || !userData.onboardingData) {
    console.log("Missing data, site name, or onboarding answers; cannot sync yet.");
    return { success: false, error: "Missing data or site name" };
  }

  // Determine profile type and instance name dynamically
  // If user onboardingData has 'full_name', it's a life profile; otherwise business.
  const onboardingData = userData.onboardingData as Record<string, any>;
  const profileType = onboardingData.full_name ? "life" : "business";
  const instanceName = userData.siteName.split('.')[0] || "MyVenture";

  console.log(`Connecting to ${userData.siteName} to commit ${profileType} profile: ${instanceName}...`);

  // The credentials come from the user row (the site was provisioned for
  // them at registration), not from the request session — so the kernel
  // client gets an explicit site, an explicit Authorization header when the
  // row carries keys, and `requireAuth: false` / `session: null` so it never
  // reads the current session or the request scope.
  const headers: Record<string, string> | undefined =
    userData.apiKey && userData.apiSecret
      ? { Authorization: `token ${userData.apiKey}:${userData.apiSecret}` }
      : undefined;

  try {
    // Universal gateway call. cmd = manifest alias key minus "{app_name}."
    // (agent module manifest key:
    // {app_name}.api.plan_builder.commit_onboarding_answers — the doubled
    // file-segment form was collapsed on agent main).
    const result = await platformCall<any>(
      "api.plan_builder.commit_onboarding_answers",
      {
        profile_type: profileType,
        instance_name: instanceName,
        answers: JSON.stringify(onboardingData),
        milestones: JSON.stringify([]), // can be expanded to sync milestones
      },
      {
        baseUrl: `https://${userData.siteName}`,
        session: null,
        requireAuth: false,
        headers,
        throwOnError: true,
      },
    );

    if (result?.status === "success") {
      console.log(`Plan committed successfully to ${userData.siteName}!`);
      return { success: true };
    } else {
      console.error(`Sync failed for ${userData.siteName}:`, result);
      return { success: false, error: result || "Failed to commit onboarding profile" };
    }
  } catch (e) {
    if (e instanceof PlatformGatewayError && e.reason === "http_error") {
      // The non-2xx answer the raw fetch surfaced as its fallback message.
      console.error(`Sync failed for ${userData.siteName}:`, e);
      return { success: false, error: "Failed to commit onboarding profile" };
    }
    console.error("Failed to connect to tenant site onboarding API", e);
    return { success: false, error: String(e) };
  }
}
