import React from "react";

import { PLATFORM_NAME, BRANDING_COUNTRY_INDEX, BRANDING_COUNTRY_SCALE, BRANDING_COUNTRY_Y_OFFSET } from "./constants";
export * from "./constants";

/**
 * Simple module-level cache to ensure branding is only fetched once per session.
 * This prevents flickering and redundant server calls.
 */
let brandingPromise: Promise<any> | null = null;

/**
 * Synchronously attempts to get branding from localStorage.
 * Used for initial state in client components to prevent "pop-in".
 */
export function getBrandingSync() {
    if (typeof window === "undefined") return null;
    try {
        const cached = localStorage.getItem("rokct_branding_data");
        if (cached) return JSON.parse(cached);
    } catch (e) { }
    return null;
}

/**
 * Shared branding resolver.
 * Calls a Server Action to get the data, ensuring DB logic stays on the server.
 */
export async function getGuestBranding(force = false) {
    // 1. Session Memory Cache (Module-level)
    if (brandingPromise && !force) return brandingPromise;

    // 2. Client-side Persistence (LocalStorage)
    if (!force) {
        const syncData = getBrandingSync();
        if (syncData) {
            // Still revalidate in background if it was just a sync restore
            if (!brandingPromise) {
                brandingPromise = Promise.resolve(syncData);
                // Trigger background refresh (don't await)
                setTimeout(() => getGuestBranding(true), 100);
            }
            return syncData;
        }
    }

    brandingPromise = (async () => {
        try {
            // CALL SERVER ACTION
            const { fetchBrandingData } = await import("@/app/actions/branding");
            const data = await fetchBrandingData();

            const brandingData = {
                ...data,
                style: {
                    display: 'inline-block',
                    fontSize: BRANDING_COUNTRY_SCALE,
                    verticalAlign: 'baseline',
                    position: 'relative' as const,
                    top: BRANDING_COUNTRY_Y_OFFSET,
                    marginLeft: '0.1em',
                    fontWeight: 600
                }
            };

            // Save to LocalStorage for next time (Client only)
            if (typeof window !== "undefined") {
                localStorage.setItem("rokct_branding_data", JSON.stringify(brandingData));
            }

            return brandingData;
        } catch (e) {
            console.error("Failed to fetch branding in config:", e);
            return {
                name: PLATFORM_NAME,
                code: "",
                showBeta: true,
                before: PLATFORM_NAME,
                after: "",
                style: {}
            };
        }
    })();

    return brandingPromise;
}

/**
 * Returns the plain platform name as a string.
 */
export const getBranding = () => PLATFORM_NAME;
