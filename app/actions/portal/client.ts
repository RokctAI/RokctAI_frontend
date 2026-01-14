"use server";

import { auth } from "@/app/(auth)/auth";
import { ClientPortalService } from "@/app/services/portal/client";
import { revalidatePath } from "next/cache";

export async function getClientSubscriptions() {
    const session = await auth();
    if (!session?.user?.email) {
        return { message: "Not logged in" };
    }

    const userEmail = session.user.email;

    try {
        // 1. Get User
        const user = await ClientPortalService.getUserByEmail(userEmail);
        if (!user) {
            return { message: "User not found" };
        }

        // 2. Get Telephony Customer & Subscriptions
        const telCustomer = await ClientPortalService.getTelephonyCustomer(user.name);
        let telephonySubs: any[] = [];
        let balance = 0;

        if (telCustomer) {
            telephonySubs = await ClientPortalService.getTelephonySubscriptions(telCustomer.name);
            balance = telCustomer.balance;
        }

        // 3. Get Hosting Subscriptions
        const hostingSubs = await ClientPortalService.getHostingSubscriptions(userEmail);

        return {
            telephony: telephonySubs,
            hosting: hostingSubs,
            balance: balance
        };

    } catch (error: any) {
        console.error("Error fetching client subscriptions:", error);
        return { message: "Failed to fetch subscriptions" };
    }
}

