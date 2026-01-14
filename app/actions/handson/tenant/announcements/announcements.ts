"use server";

import { AnnouncementService } from "@/app/services/tenant/announcements";
import { SubscriptionService } from "@/app/services/tenant/subscriptions";

export async function getMyAnnouncements() {
    try {
        // 1. Fetch all global broadcasts
        const allAnnouncements = await AnnouncementService.getGlobalAnnouncements();

        // 2. Fetch my subscription plan
        // If sub module not fully ready, fallback to "Simple"
        let myPlan = "Simple";
        try {
            const status = await SubscriptionService.getSubscriptionStatus();
            if (status && status.plan_name) {
                myPlan = status.plan_name;
                // Map complex plan names to simple categories if needed
                if (myPlan.includes("Pro")) myPlan = "Pro";
                if (myPlan.includes("Enterprise")) myPlan = "Enterprise";
            }
        } catch (e) {
            // ignore
        }

        // 3. Filter
        const relevant = allAnnouncements.filter(ann => {
            if (!ann.is_active) return false;
            if (ann.target_plans.includes("All")) return true;
            return ann.target_plans.some(p => myPlan.includes(p));
        });

        return relevant;

    } catch (e) {
        console.error("Failed to fetch tenant announcements", e);
        return [];
    }
}
