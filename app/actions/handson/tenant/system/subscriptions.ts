"use server";

import { SubscriptionService } from "@/app/services/tenant/subscriptions";

export async function getSubscriptionStatus() {
    return SubscriptionService.getSubscriptionStatus();
}
