import Link from "next/link";
import { PLATFORM_NAME, LEGAL_COMPANY_NAME } from "@/app/config/platform";
import { TermsService } from "@/app/services/control/terms";
import { BrandLogo } from "./brand-logo";
import { RoadmapPublicService } from "@/app/services/public/roadmap";
import { Twitter, Youtube, Linkedin, Instagram, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import versionData from "@/version.json";

async function PublicRoadmapLink() {
  try {
    const roadmap = await RoadmapPublicService.getPublicRoadmap();
    const data = roadmap?.message || roadmap;
    if (data && data.title) {
      return (
        <Link
          href="/public/roadmap"
          className="text-base text-gray-400 hover:text-white transition-colors"
        >
          Roadmap
        </Link>
      );
    }
  } catch (e) {}
  return null;
}

export async function Footer() {
  let terms: any[] = [];
  try {
    const fetchedTerms = await TermsService.getMasterTerms();
    if (Array.isArray(fetchedTerms)) terms = fetchedTerms;
  } catch (e) {}

  let isOnline = false;

  try {
    const { VersionsService } = await import("@/app/services/public/versions");
    const versions = await VersionsService.getPublicVersions();
    if (versions) {
        isOnline = true;
    }
  } catch (e) {}

  // Helper to find term by likely title or name
  const getTermLink = (preferredTitle: string) => {
    const term = terms.find(t => t.title?.toLowerCase().includes(preferredTitle.toLowerCase()) || t.name?.toLowerCase().includes(preferredTitle.toLowerCase()));
    if (term) return `/legal/${term.name}`;
    return "#";
  };

  const version = versionData.frontend;

  return (
    <footer className="bg-black text-white pt-24 pb-12 border-t border-white/5">
      <div className="container mx-auto px-6 max-w-screen-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-12 mb-24">
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <div className="flex items-center gap-3">
              <BrandLogo width={32} height={32} />
              <span className="text-2xl font-bold text-white uppercase tracking-tighter italic">
                {PLATFORM_NAME}
              </span>
            </div>
            <p className="text-base text-gray-400 leading-relaxed max-w-[240px]">
              All-in-One AI extension to Write, Summarize, Code & Play
            </p>
            <Button className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold py-6 rounded-lg text-lg">
              Contact us
            </Button>
            <div className="flex gap-6 mt-2">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter className="w-6 h-6" /></Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors"><Youtube className="w-6 h-6" /></Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin className="w-6 h-6" /></Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram className="w-6 h-6" /></Link>
            </div>
            <div className="mt-4">
               <button className="flex items-center gap-2 bg-zinc-900 px-6 py-3 rounded-xl text-gray-300 hover:text-white transition-colors">
                  English <ChevronDown className="w-4 h-4" />
               </button>
            </div>
          </div>

          {/* Column 2: Productivity */}
          <div className="flex flex-col gap-6">
            <h4 className="font-bold text-gray-500 uppercase tracking-widest text-xs">Productivity</h4>
            <div className="flex flex-col gap-4">
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">AI for Google</Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">AI for Twitter</Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">AI for LinkedIn</Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">AI Transformation</Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">Text to Image - Bonkers</Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">AI Email Writer</Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">Question AI</Link>
            </div>
          </div>

          {/* Column 3: AI Chat */}
          <div className="flex flex-col gap-6">
            <h4 className="font-bold text-gray-500 uppercase tracking-widest text-xs">AI chat</h4>
            <div className="flex flex-col gap-4">
              <Link href="/chat" className="text-base text-gray-400 hover:text-white transition-colors">Chat with {PLATFORM_NAME}</Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">Free GPT-4o</Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">Chat with Web Access</Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">Chat with PDF</Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">Chat with Websites</Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">Chat with Image</Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">Ask AI</Link>
            </div>
          </div>

          {/* Column 4: AI Tools */}
          <div className="flex flex-col gap-6">
            <h4 className="font-bold text-gray-500 uppercase tracking-widest text-xs">AI Tools</h4>
            <div className="flex flex-col gap-4">
              <Link href="#" className="text-base text-gray-400 hover:text-white flex items-center gap-2">
                AI Detector <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">New</span>
              </Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">AI Essay Writer</Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white flex items-center gap-2">
                Plagiarism Checker <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">New</span>
              </Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white flex items-center gap-2">
                AI Translator <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">New</span>
              </Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">Bible GPT</Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white flex items-center gap-2">
                70+ More AI Tools <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">New</span>
              </Link>
            </div>
          </div>

          {/* Column 5: Summary */}
          <div className="flex flex-col gap-6">
            <h4 className="font-bold text-gray-500 uppercase tracking-widest text-xs">Summary</h4>
            <div className="flex flex-col gap-4">
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">YouTube Summarizer</Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">Article Summarizer</Link>
            </div>
          </div>

          {/* Column 6: Company */}
          <div className="flex flex-col gap-6">
            <h4 className="font-bold text-gray-500 uppercase tracking-widest text-sm">Company</h4>
            <div className="flex flex-col gap-4">
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">Team</Link>
              <Link href={getTermLink("Privacy")} className="text-base text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href={getTermLink("Legal")} className="text-base text-gray-400 hover:text-white transition-colors">Legal</Link>
              <Link href={getTermLink("Cookie")} className="text-base text-gray-400 hover:text-white transition-colors">Cookie Policy</Link>
              <Link href={getTermLink("Terms and Conditions")} className="text-base text-gray-400 hover:text-white transition-colors">Terms and Conditions</Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">Data Protection</Link>
              <Link href="/careers" className="text-base text-gray-400 hover:text-white transition-colors">Careers</Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">Refund Policy</Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">Query Standards</Link>
            </div>
          </div>

          {/* Column 7: Resources */}
          <div className="flex flex-col gap-6">
            <h4 className="font-bold text-gray-500 uppercase tracking-widest text-sm">Resources</h4>
            <div className="flex flex-col gap-4">
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">Product Wiki</Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">Newsroom</Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">Blogs</Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">Change Shortcut</Link>
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">How It Works</Link>
              <PublicRoadmapLink />
              <Link href="#" className="text-base text-gray-400 hover:text-white transition-colors">Feature Request</Link>
              <button className="text-base text-gray-400 hover:text-white transition-colors text-left">Cookie preferences</button>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-6">
          <p className="text-sm text-gray-500">
            © Copyright {new Date().getFullYear()} - {LEGAL_COMPANY_NAME}
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">System {isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <span className="text-xs font-mono font-bold text-gray-700 uppercase">Version {version}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
