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

import Image from "next/image";
import { useEffect, useState } from "react";
import { PLATFORM_NAME } from "@/app/config/platform";

export function BrandLogo({
  width = 24,
  height = 24,
  className,
  variant = "auto",
  showBadge = false,
  isCircle = false,
  priority = false,
}: {
  width?: number;
  height?: number;
  className?: string;
  variant?: "auto" | "light" | "dark" | "inverted";
  showBadge?: boolean;
  isCircle?: boolean;
  priority?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const branding =
    mounted && typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("rokct_branding_data") || "null")
      : null;
  const isBeta = branding?.showBeta !== false;

  const imageClasses = `${className || ""} ${showBadge && isBeta ? "mb-[14%]" : ""}`;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${isCircle ? "rounded-full" : "rounded-[5px]"} bg-gradient-to-br from-zinc-800 to-zinc-950 dark:from-zinc-100 dark:to-zinc-300`}
      style={{ width, height, minWidth: width, minHeight: height }}
    >
      {/* CSS-based theme-toggling images to prevent hydration flicker on first paint */}
      {variant === "auto" && (
        <>
          <Image
            src="/images/logo.svg"
            height={height * 0.55}
            width={width * 0.55}
            alt={PLATFORM_NAME}
            className={`${imageClasses} dark:hidden`}
            priority={priority}
          />
          <Image
            src="/images/logo_dark.svg"
            height={height * 0.55}
            width={width * 0.55}
            alt={PLATFORM_NAME}
            className={`${imageClasses} hidden dark:block`}
            priority={priority}
          />
        </>
      )}

      {variant === "light" && (
        <Image
          src="/images/logo_dark.svg"
          height={height * 0.55}
          width={width * 0.55}
          alt={PLATFORM_NAME}
          className={imageClasses}
          priority={priority}
        />
      )}

      {variant === "dark" && (
        <Image
          src="/images/logo.svg"
          height={height * 0.55}
          width={width * 0.55}
          alt={PLATFORM_NAME}
          className={imageClasses}
          priority={priority}
        />
      )}

      {variant === "inverted" && (
        <>
          <Image
            src="/images/logo_dark.svg"
            height={height * 0.55}
            width={width * 0.55}
            alt={PLATFORM_NAME}
            className={`${imageClasses} dark:hidden`}
            priority={priority}
          />
          <Image
            src="/images/logo.svg"
            height={height * 0.55}
            width={width * 0.55}
            alt={PLATFORM_NAME}
            className={`${imageClasses} hidden dark:block`}
            priority={priority}
          />
        </>
      )}

      {showBadge && isBeta && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-yellow-400 text-black font-bold text-center uppercase tracking-tight flex items-center justify-center"
          style={{ height: "28%", fontSize: Math.max(7, width * 0.19) }}
        >
          BETA
        </div>
      )}
    </div>
  );
}
