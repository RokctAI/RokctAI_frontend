/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
