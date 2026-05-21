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
    <div className="relative inline-flex items-center justify-center">
      <Image
        src={src}
        height={height}
        width={width}
        alt={PLATFORM_NAME}
        className={className}
        priority
      />
      {showBadge && isBeta && (
        <div className="absolute -top-[15%] right-[5%] bg-yellow-400 text-black text-[9px] leading-none font-bold px-1 py-0.5 rounded-sm uppercase shadow-sm">
          BETA
        </div>
      )}
      {showBadge && countryCode && (
        <div className="absolute -bottom-[5%] -left-[10%] text-zinc-400 text-[9px] font-bold bg-white/10 px-1 rounded backdrop-blur-md">
          {countryCode}
        </div>
      )}
    </div>
  );
}
