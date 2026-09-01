/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
  forceWhite = false,
  className,
}: {
  showBadge?: boolean;
  forceWhite?: boolean;
  className?: string;
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
      <span className="flex items-center gap-1.5">
        <span
          className={`${className || "text-2xl"} font-sans font-bold tracking-tight leading-none ${forceWhite ? "text-white" : "text-black dark:text-white"}`}
        >
          {PLATFORM_NAME}
        </span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`${className || "text-2xl"} font-sans font-bold tracking-tight leading-none ${forceWhite ? "text-white" : "text-black dark:text-white"}`}
      >
        {branding.before}
        {showBadge && branding.code && (
          <span style={branding.style}>{branding.code}</span>
        )}
        {branding.after}
      </span>
    </span>
  );
}
