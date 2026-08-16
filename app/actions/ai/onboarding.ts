"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/app/(auth)/auth";

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

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (userData.apiKey && userData.apiSecret) {
    headers["Authorization"] = `token ${userData.apiKey}:${userData.apiSecret}`;
  }

  try {
    // Manifest alias key: {app_name}.api.plan_builder.commit_onboarding_answers.commit_onboarding_answers
    // (agent module manifest) - the single-leaf form does not exist on the backend.
    const url = `https://${userData.siteName}/api/v1/method/rcore.api.plan_builder.commit_onboarding_answers.commit_onboarding_answers`;
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        profile_type: profileType,
        instance_name: instanceName,
        answers: JSON.stringify(onboardingData),
        milestones: JSON.stringify([]), // can be expanded to sync milestones
      }),
    });

    const result = await response.json();
    
    if (response.ok && result.message?.status === "success") {
      console.log(`Plan committed successfully to ${userData.siteName}!`);
      return { success: true };
    } else {
      console.error(`Sync failed for ${userData.siteName}:`, result);
      return { success: false, error: result.message || "Failed to commit onboarding profile" };
    }
  } catch (e) {
    console.error("Failed to connect to tenant site onboarding API", e);
    return { success: false, error: String(e) };
  }
}
