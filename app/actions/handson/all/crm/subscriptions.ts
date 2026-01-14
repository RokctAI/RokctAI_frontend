"use server";

import { CommercialService } from "@/app/services/all/crm/commercial";
import { revalidatePath } from "next/cache";
import { verifyCrmRole } from "@/app/lib/roles";

// --- SUBSCRIPTIONS ---

/**
 * Fetches Subscription Plans.
 */
export async function getSubscriptionPlans() {
    if (!await verifyCrmRole()) return [];
    try {
        const res = await CommercialService.getSubscriptionPlans();
        return res.data;
    } catch (e) { return []; }
}

/**
 * Creates a Subscription Plan.
 */
export async function createSubscriptionPlan(data: { plan_name: string; currency: string; cost: number; billing_interval: "Month" | "Year" }) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    try {
        const response = await CommercialService.createSubscriptionPlan(data);
        revalidatePath("/handson/all/accounting/selling/subscriptions/plan");
        return { success: true, message: response };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}

/**
 * Fetches Subscriptions.
 */
export async function getSubscriptions() {
    if (!await verifyCrmRole()) return [];
    try {
        const res = await CommercialService.getSubscriptions();
        return res.data;
    } catch (e) { return []; }
}

/**
 * Creates a Subscription.
 */
export async function createSubscription(data: { party_type: string; party: string; plans: { plan: string; qty: number }[] }) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    try {
        const response = await CommercialService.createSubscription(data);
        revalidatePath("/handson/all/accounting/selling/subscriptions/subscription");
        return { success: true, message: response };
    } catch (e: any) { return { success: false, error: e?.message || "Error" }; }
}
