
import "server-only";

import { getCurrentSession } from "@/app/(auth)/actions";
import { getFrappeClient } from "@/lib/frappe";
import { db } from "@/db";
import { globalSettings } from "@/db/schema";

export async function getPaaSClient() {
    const session = await getCurrentSession();
    if (!session || !session.user) throw new Error("Unauthorized");

    const apiKey = (session.user as any).apiKey;
    const apiSecret = (session.user as any).apiSecret;
    const siteName = (session.user as any).siteName;

    // Ensure siteName is a full URL if present
    let url = siteName;
    if (siteName && !siteName.startsWith('http')) {
        url = siteName.includes('localhost') ? `http://${siteName}` : `https://${siteName}`;
    }

    // If url is undefined/null, getFrappeClient will fall back to process.env.NEXT_PUBLIC_FRAPPE_URL
    return getFrappeClient({ apiKey, apiSecret, url });
}

export async function getControlClient() {
    const session = await getCurrentSession();
    if (!session || !session.user) throw new Error("Unauthorized");

    const apiKey = (session.user as any).apiKey;
    const apiSecret = (session.user as any).apiSecret;

    // Explicitly ignore siteName from session to ensure we connect to the Control Plane (default URL)
    // getFrappeClient falls back to process.env.NEXT_PUBLIC_FRAPPE_URL if url is undefined
    return getFrappeClient({ apiKey, apiSecret });
}

// Default export for backward compatibility if needed, but prefer named exports
export default getPaaSClient;
export const getClient = getPaaSClient;

/**
 * System Client for Control Plane access (No User Session required).
 * Used for fetching global configurations (Workflows, Terms) on behalf of Tenant Users.
 * Reads Admin Keys from GlobalSettings (requires Admin to have logged in once).
 */
export async function getSystemControlClient() {
    let apiKey: string | undefined;
    let apiSecret: string | undefined;

    try {
        const settings = await db.select().from(globalSettings).limit(1);
        if (settings.length > 0) {
            apiKey = settings[0].adminApiKey || undefined;
            apiSecret = settings[0].adminApiSecret || undefined;
        }
    } catch (e) {
        console.error("Failed to fetch System Keys from DB", e);
    }

    if (!apiKey || !apiSecret) {
        throw new Error("System Identity not initialized. Please Log In as Administrator first to save keys.");
    }

    return getFrappeClient({ apiKey, apiSecret });
}

export function getGuestClient() {
    return getFrappeClient();
}
