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

  // Determine logo src
  let src = "/images/logo_dark.svg"; // Default (Light Mode -> Black Logo)
  if (mounted) {
    if (variant === "auto") {
      if (resolvedTheme === "dark") src = "/images/logo.svg";
    } else if (variant === "dark") {
      src = "/images/logo.svg";
    } else if (variant === "light") {
      src = "/images/logo_dark.svg";
    } else if (variant === "inverted") {
      if (resolvedTheme === "light") src = "/images/logo.svg";
      else src = "/images/logo_dark.svg";
    }
  }

  const branding = mounted && typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("rokct_branding_data") || "null")
    : null;
  const isBeta = branding?.showBeta !== false;

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-300 dark:from-zinc-800 dark:to-zinc-950"
      style={{ width, height, minWidth: width, minHeight: height }}
    >
      <Image
        src={src}
        height={height * 0.55}
        width={width * 0.55}
        alt={PLATFORM_NAME}
        className={`${className || ""} ${showBadge && isBeta ? "mb-[14%]" : ""}`}
        priority
      />
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
