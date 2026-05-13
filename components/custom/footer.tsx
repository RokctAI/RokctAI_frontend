import Link from "next/link";
import { PLATFORM_NAME, LEGAL_COMPANY_NAME } from "@/app/config/platform";
import { TermsService } from "@/app/services/control/terms";
import { BrandLogo } from "./brand-logo";
import { RoadmapPublicService } from "@/app/services/public/roadmap";
import { Twitter, Youtube, Linkedin, Instagram, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

async function PublicRoadmapLink() {
  try {
    const roadmap = await RoadmapPublicService.getPublicRoadmap();
    const data = roadmap?.message || roadmap;

    if (data && data.title) {
      return (
        <Link
          href="/public/roadmap"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 group"
          title={`View Public Roadmap: ${data.title}`}
        >
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
    if (
      e?.exc_type !== "PermissionError" &&
      !e?.message?.includes("PermissionError")
    ) {
      console.error("Footer jobs fetch error:", e);
    }
  }

  let version = "v1.0.0";
  let isOnline = false;
  let errorMessage = "";

  try {
    const { VersionsService } = await import("@/app/services/public/versions");
    if (
      VersionsService &&
      typeof VersionsService.getPublicVersions === "function"
    ) {
      const versions = await VersionsService.getPublicVersions().catch(
        (err: any) => {
          errorMessage = err instanceof Error ? err.message : String(err);
          return null;
        },
      );
      if (versions) {
        let data = versions;
        while (data && data.message) {
          data = data.message;
        }

        let verValue = "";
        if (data && typeof data === "object") {
          const appData =
            data.control ||
            Object.values(data).find((v: any) => v && v.version);
          if (appData && typeof appData.version === "string") {
            verValue = appData.version;
          } else if (typeof data.version === "string") {
            verValue = data.version;
          }
        }

        if (verValue) {
          version = `v${verValue}`;
          isOnline = true;
        } else if (data && Object.keys(data).length > 0) {
          isOnline = true;
        }
      }
    }
  } catch (e: any) {
    errorMessage = e.message || String(e);
  }

  return (
    <footer className="border-t bg-background pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Column 1: Logo & Brand Info */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <div className="flex items-center gap-2">
              <BrandLogo width={32} height={32} variant="auto" />
              <span className="text-2xl font-bold tracking-tight">{PLATFORM_NAME}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All-in-One AI extension to Write, Summarize, Code & Play
            </p>
            <Button variant="outline" className="w-fit bg-[#4f46e5] hover:bg-[#4338ca] text-white border-none rounded-md px-8">
              Contact us
            </Button>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Youtube className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
            </div>
            <div className="mt-4">
              <Button variant="ghost" size="sm" className="bg-secondary/50 rounded-full px-4 flex gap-2">
                English <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Column 2: Productivity */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Productivity</h4>
            <div className="flex flex-col gap-3">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">AI for Google</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">AI for Twitter</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">AI for LinkedIn</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">AI Transformation</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Text to Image - Bonkers</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">AI Email Writer</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Question AI</Link>
            </div>
          </div>

          {/* Column 3: AI Chat */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">AI chat</h4>
            <div className="flex flex-col gap-3">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Chat with Merlin</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Free GPT-4o</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Chat with Web Access</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Chat with PDF</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Chat with Websites</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Chat with Image</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Ask AI</Link>
            </div>
          </div>

          {/* Column 4: AI Tools */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">AI Tools</h4>
            <div className="flex flex-col gap-3">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                AI Detector <span className="text-[10px] bg-blue-100 text-blue-600 px-1 rounded dark:bg-blue-900 dark:text-blue-200">New</span>
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">AI Essay Writer</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                Plagiarism Checker <span className="text-[10px] bg-blue-100 text-blue-600 px-1 rounded dark:bg-blue-900 dark:text-blue-200">New</span>
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                AI Translator <span className="text-[10px] bg-blue-100 text-blue-600 px-1 rounded dark:bg-blue-900 dark:text-blue-200">New</span>
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Bible GPT</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                70+ More AI Tools <span className="text-[10px] bg-blue-100 text-blue-600 px-1 rounded dark:bg-blue-900 dark:text-blue-200">New</span>
              </Link>
            </div>
          </div>

          {/* Column 5: Summary & Company */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-foreground">Summary</h4>
              <div className="flex flex-col gap-3">
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">YouTube Summarizer</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Article Summaizer</Link>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-foreground">Company</h4>
              <div className="flex flex-col gap-3">
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Team</Link>
                {terms.map((term) => (
                  <Link
                    key={term.name}
                    href={`/legal/${term.name}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {term.title}
                  </Link>
                ))}
                {openings.length > 0 && (
                  <Link href="/careers" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                    Careers
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                    </span>
                  </Link>
                )}
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Refund Policy</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Query Standards</Link>
              </div>
            </div>
          </div>

          {/* Column 6: Resources */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Resources</h4>
            <div className="flex flex-col gap-3">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Product Wiki</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Newsroom</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blogs</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Change Shortcut</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
              <PublicRoadmapLink />
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Feature Request</Link>
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left">Cookie preferences</button>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col gap-6 pt-8 border-t border-border/50">
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground text-center">
              Disclaimer: {PLATFORM_NAME} can make mistakes so double-check it and use code with caution.
            </p>
            <p className="text-[10px] text-muted-foreground/60 text-center">
              {PLATFORM_NAME} is a trademark of {LEGAL_COMPANY_NAME}. &copy; {new Date().getFullYear()} {LEGAL_COMPANY_NAME}. All rights reserved.
            </p>
          </div>

          <div className="flex justify-center items-center gap-4">
             <div className="flex items-center gap-1.5" title={errorMessage || "System Online"}>
              <BrandLogo width={16} height={16} variant="auto" className="opacity-80" />
              <div className="relative flex h-2 w-2 items-center justify-center">
                <div
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-pulse ${isOnline ? "bg-emerald-500" : "bg-red-500"}`}
                  style={{ filter: "blur(1px)" }}
                ></div>
                <div
                  className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isOnline ? "bg-emerald-500" : "bg-red-500"}`}
                ></div>
              </div>
              <Link href="/status" className="hover:opacity-80 transition-opacity">
                <span className="text-[10px] font-mono font-bold text-muted-foreground leading-none">
                  {version}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
