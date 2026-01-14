"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { PLATFORM_NAME } from "@/app/config/platform";

export function BrandLogo({ width = 24, height = 24, className, variant = "auto" }: { width?: number; height?: number; className?: string; variant?: "auto" | "light" | "dark" | "inverted" }) {
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

    return (
        <Image
            src={src}
            height={height}
            width={width}
            alt={PLATFORM_NAME}
            className={className}
            priority
        />
    );
}
