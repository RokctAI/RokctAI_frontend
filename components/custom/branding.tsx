"use client";

import React, { useEffect, useState } from "react";
import {
  PLATFORM_NAME,
  getGuestBranding,
  getBrandingSync,
} from "@/app/config/platform";

/**
 * A Client Component that displays the platform name with the country code.
 * It uses localStorage caching to ensure the branding appears instantly on refresh.
 * Uses a 'mounted' state to prevent hydration mismatches from localStorage access.
 */
export function Branding({ 
  showBadge = false,
  forceWhite = false
}: { 
  showBadge?: boolean;
  forceWhite?: boolean;
}) {
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
        <span className={`text-xl font-bold italic ${forceWhite ? 'text-white' : 'text-black dark:text-white'}`}>
          {PLATFORM_NAME}
        </span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`text-xl tracking-tighter leading-none ${forceWhite ? 'text-white' : 'text-black dark:text-white'}`}
        style={{
          fontFamily: '"Arial Black", "Arial", sans-serif',
          fontWeight: 900,
        }}
      >
        {branding.before}
        {branding.after}
      </span>
    </span>
  );
}
