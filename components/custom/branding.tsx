"use client";

import React, { useEffect, useState } from "react";
import { PLATFORM_NAME, getGuestBranding, getBrandingSync } from "@/app/config/platform";

/**
 * A Client Component that displays the platform name with the country code.
 * It uses localStorage caching to ensure the branding appears instantly on refresh.
 * Uses a 'mounted' state to prevent hydration mismatches from localStorage access.
 */
export function Branding({ showBadge = false }: { showBadge?: boolean }) {
    const [mounted, setMounted] = useState(false);
    const [branding, setBranding] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
        // Load from sync cache immediately on mount
        const cached = getBrandingSync();
        if (cached) setBranding(cached);

        // Refresh from server in background
        getGuestBranding().then(setBranding);
    }, []);

    // Fallback during initial load or server-side render
    if (!mounted || !branding) {
        return (
            <span className="flex items-center gap-2">
                <span className="text-xl text-black dark:text-white font-bold italic">{PLATFORM_NAME}</span>
            </span>
        );
    }

    const isBeta = branding.showBeta !== false;
    const showSuperscript = showBadge && !isBeta;
    const showBetaBadge = showBadge && isBeta;

    return (
        <span className="flex items-center gap-1.5">
            <span
                className="text-xl text-black dark:text-white tracking-tighter leading-none"
                style={{ fontFamily: '"Arial Black", "Arial", sans-serif', fontWeight: 900 }}
            >
                {branding.before}
                {showSuperscript && <span style={branding.style}>{branding.code}</span>}
                {branding.after}
            </span>
            {showBetaBadge && (
                <span className="flex items-start gap-0">
                    <span className="text-[10px] bg-black text-white dark:bg-yellow-400 dark:text-black rounded-full px-2 py-0.5 font-sans not-italic font-bold uppercase tracking-tighter">
                        Beta
                    </span>
                    <span className="text-[9px] font-bold text-zinc-800 dark:text-zinc-300 -mt-1 ml-px">
                        {branding.code}
                    </span>
                </span>
            )}
        </span>
    );
}
