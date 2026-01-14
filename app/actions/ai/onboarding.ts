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
            }[]
        }[]
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
        await db.update(user)
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
        await db.update(user)
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

/**
 * Dummy Script: Pushes the saved plan to the Tenant Site.
 * This corresponds to the user's request: "once site is ready we push it to the site".
 */
export async function syncOnboardingToSite(userEmail: string) {
    console.log(`[DUMMY SCRIPT] Syncing onboarding data for ${userEmail} to Tenant Site...`);

    // 1. Fetch user and their data
    const dbUser = await db.select().from(user).where(eq(user.email, userEmail)).limit(1);
    const userData = dbUser[0];

    if (!userData || !userData.siteName || !userData.onboardingData) {
        console.log("[DUMMY SCRIPT] Missing data or site name, cannot sync yet.");
        return;
    }

    console.log(`[DUMMY SCRIPT] Connecting to ${userData.siteName}...`);
    // 2. Real implementation would use fetch() to call `rokct.rokct.api.plan_builder.commit_plan`
    // const response = await fetch(`https://${userData.siteName}/api/method/rokct.rokct.api.plan_builder.commit_plan`, { ... });

    console.log(`[DUMMY SCRIPT] Plan committed successfully to ${userData.siteName}!`);
}
