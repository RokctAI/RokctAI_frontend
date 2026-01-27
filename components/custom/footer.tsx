import Link from "next/link";
import { PLATFORM_NAME, LEGAL_COMPANY_NAME } from "@/app/config/platform";
import { TermsService } from "@/app/services/control/terms";
import { BrandLogo } from "./brand-logo";
import { RoadmapPublicService } from "@/app/services/public/roadmap";
import { Map } from "lucide-react";

async function PublicRoadmapLink() {
  try {
    const roadmap = await RoadmapPublicService.getPublicRoadmap();
    // Validate if roadmap exists (check for title or valid object)
    // The API returns { title, description, features } or null or { message: ... }
    const data = roadmap?.message || roadmap;

    if (data && data.title) {
      return (
        <Link
          href="/public/roadmap"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 group"
          title={`View Public Roadmap: ${data.title}`}
        >
          <Map className="w-3 h-3 opacity-70 group-hover:opacity-100" />
          Roadmap
        </Link>
      );
    }
  } catch (e) {
    // Fail silently
  }
  return null;
}

export async function Footer() {
  let terms: any[] = [];
  try {
    const fetchedTerms = await TermsService.getMasterTerms();
    if (Array.isArray(fetchedTerms)) {
      terms = fetchedTerms;
    }
  } catch (e) {
    // Fail silently in footer
    console.error("Footer fetch error:", e);
  }

  let openings: any[] = [];
  try {
    const { JobsService } = await import("@/app/services/control/jobs");
    const fetchedOpenings = await JobsService.getOpenings();
    if (Array.isArray(fetchedOpenings)) {
      openings = fetchedOpenings;
    }
  } catch (e: any) {
    // Fail silently. Permissions might be missing for Job Opening (Guest/Admin).
    // Only log if NOT a permission error to avoid build noise.
    if (e?.exc_type !== "PermissionError" && !e?.message?.includes("PermissionError")) {
      console.error("Footer jobs fetch error:", e);
    }
  }

  let version = "v1.0.0";
  let isOnline = false;

  let errorMessage = "";

  try {
    const { VersionsService } = await import("@/app/services/public/versions");
    if (VersionsService && typeof VersionsService.getPublicVersions === 'function') {
      const versions = await VersionsService.getPublicVersions().catch((err: any) => {
        errorMessage = err instanceof Error ? err.message : String(err);
        return null;
      });
      if (versions) {
        // Deep unwrap: handle any level of "message" nesting from Frappe/SDK
        let data = versions;
        while (data && data.message) {
          data = data.message;
        }

        // Extract version: Look for ROKCT explicitly, then any app, then a raw version string
        let verValue = "";
        if (data && typeof data === 'object') {
          const appData = data.control || Object.values(data).find((v: any) => v && v.version);
          if (appData && typeof appData.version === 'string') {
            verValue = appData.version;
          } else if (typeof data.version === 'string') {
            verValue = data.version;
          }
        }

        if (verValue) {
          version = `v${verValue}`;
          isOnline = true;
        } else if (data && Object.keys(data).length > 0) {
          // If we have any data, consider the system online even if versioning is weird
          isOnline = true;
        }
      }
    }
  } catch (e: any) {
    // Fail silently to prevent Server Component crash
    errorMessage = e.message || String(e);
  }

  return (
    <footer className="border-t relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-4 py-6">
          <nav className="flex flex-wrap justify-center gap-8">
            {openings.length > 0 && (
              <Link
                href="/careers"
                className="text-sm text-muted-foreground hover:text-foreground relative"
              >
                We are hiring
                <span className="absolute -top-2 -right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
              </Link>
            )}
            {terms.map((term) => (
              <Link
                key={term.name}
                href={`/legal/${term.name}`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {term.title}
              </Link>
            ))}
            {/* Public Roadmap Link */}
            <PublicRoadmapLink />
          </nav>
          <div className="flex flex-col gap-1 items-center">
            <p className="text-xs text-muted-foreground text-center">
              Disclaimer: {PLATFORM_NAME} can make mistakes so double-check it and use code with caution.
            </p>
            <p className="text-[10px] text-muted-foreground/60 text-center">
              {PLATFORM_NAME} is a trademark of {LEGAL_COMPANY_NAME}. &copy; {new Date().getFullYear()} {LEGAL_COMPANY_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Stacked Logo & Version (No Triangle) */}
      <div className="absolute bottom-3 right-4 flex flex-col items-center gap-0.5">

        {/* Row 1: Logo and Dot */}
        <div className="flex items-center gap-1.5" title={errorMessage || "System Online"}>
          <BrandLogo width={16} height={16} variant="auto" className="opacity-80" />
          {/* Status Dot */}
          <div className="relative flex h-2 w-2 items-center justify-center pointer-events-auto">
            <div
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-pulse ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}
              style={{ filter: 'blur(1px)' }}
            ></div>
            <div
              className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}
            ></div>
          </div>
        </div>

        {/* Row 2: Version Text */}
        <Link href="/status" className="hover:opacity-80 transition-opacity">
          <span className="text-[10px] font-mono font-bold text-muted-foreground leading-none cursor-pointer">
            {version}
          </span>
        </Link>
      </div>
    </footer>
  );
}
