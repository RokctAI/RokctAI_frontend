"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { PLATFORM_NAME } from "@/app/config/platform";

export function BrandLogo({
  width = 24,
  height = 24,
  className,
  variant = "auto",
  showBadge = false,
}: {
  width?: number;
  height?: number;
  className?: string;
  variant?: "auto" | "light" | "dark" | "inverted";
  showBadge?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder or default to logo_dark.svg (assuming light mode default) to avoid layout shift
    // Or return nothing effectively
    return (
      <Image
        src="/images/logo_dark.svg"
        height={height}
        width={width}
        alt={PLATFORM_NAME}
        className={className}
        priority
      />
    );
  }

  let src = "/images/logo_dark.svg"; // Default (Light Mode -> Black Logo)

  if (variant === "auto") {
    if (resolvedTheme === "dark") src = "/images/logo.svg"; // Dark Mode -> White Logo
  } else if (variant === "dark") {
    src = "/images/logo.svg"; // Force White Logo
  } else if (variant === "light") {
    src = "/images/logo_dark.svg"; // Force Black Logo
  } else if (variant === "inverted") {
    if (resolvedTheme === "light") src = "/images/logo.svg";
    else src = "/images/logo_dark.svg";
  }

  const branding = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("rokct_branding_data") || "null") : null;
  const isBeta = branding?.showBeta !== false;
  const countryCode = branding?.code;

  return (
    <div 
      className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-200 dark:from-zinc-800 dark:to-zinc-950 shadow-sm border border-black/5 dark:border-white/10"
      style={{ width, height, minWidth: width, minHeight: height }}
    >
      <Image
        src={src}
        height={height * 0.55}
        width={width * 0.55}
        alt={PLATFORM_NAME}
        className={`${className || ''} ${showBadge && isBeta ? 'mb-[15%]' : ''}`}
        priority
      />
      {showBadge && isBeta && (
        <div 
          className="absolute bottom-0 left-0 right-0 bg-yellow-400 text-black font-extrabold text-center uppercase tracking-tight flex items-center justify-center"
          style={{ height: '30%', fontSize: Math.max(8, width * 0.22) }}
        >
          BETA
        </div>
      )}
    </div>
  );
}
