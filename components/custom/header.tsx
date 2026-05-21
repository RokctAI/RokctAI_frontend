"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiChevronDown, FiMenu, FiX, FiBox, FiGlobe, FiSmartphone, FiArrowUpRight, FiMonitor } from "react-icons/fi";
import { Branding } from "./branding";
import { BrandLogo } from "./brand-logo";
import { ThemeToggle } from "./theme-toggle";
import { PLATFORM_NAME, getBrandingSync } from "@/app/config/platform";

export function Header({
  loginUrl = "/login",
  signupUrl = "/register",
  session = null,
}: {
  loginUrl?: string;
  signupUrl?: string;
  session?: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [logoCollapsed, setLogoCollapsed] = useState(false);
  const [branding, setBranding] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Read branding immediately from cache
    setBranding(getBrandingSync());
    // Collapse the logo text shortly after page load
    const timer = setTimeout(() => setLogoCollapsed(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const user = session?.user;

  return (
    <header className="fixed w-full top-0 z-50 bg-white/5 dark:bg-black/5 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <div className="relative flex items-center h-[44px]">
                <BrandLogo width={44} height={44} showBadge={true} />
                {/* Country code appears next to logo when collapsed */}
                <div
                  className="transition-all duration-500 overflow-hidden flex items-start"
                  style={{
                    width: logoCollapsed ? (branding?.code ? '36px' : '0px') : '0px',
                    height: '44px',
                    opacity: logoCollapsed ? 1 : 0,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      transition: 'all 0.5s ease-in-out',
                      alignSelf: 'flex-start',
                      marginTop: '-2px',
                      fontSize: '20px',
                      fontWeight: 500,
                      marginLeft: '4px',
                      ...branding?.style,
                    }}
                  >
                    {branding?.code}
                  </span>
                </div>
              </div>
              {/* Brand text slides away after load */}
              <div
                className="overflow-hidden transition-all duration-500 ease-in-out flex items-center"
                style={{ width: logoCollapsed ? '0px' : '250px', opacity: logoCollapsed ? 0 : 1 }}
              >
                <div className="pl-2 flex items-center" style={{ paddingTop: '2px' }}>
                  <Branding showBadge={false} className="text-[60px] tracking-tighter leading-none" />
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 h-full">

            {/* Product dropdown */}
            <div
              className="relative flex items-center h-full"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <button className={`flex items-center gap-1.5 text-[14px] font-semibold px-3 py-1.5 rounded-md transition-all ${isMegaMenuOpen ? 'bg-white/10 dark:bg-white/10 text-black dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-white/8 dark:hover:bg-white/8'}`}>
                Product <FiChevronDown className={`transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega Menu — anchored to the header bottom */}
              <div
                className={`fixed left-0 right-0 top-16 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.4)] transition-all duration-200 z-50 ${isMegaMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}
              >
                <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-8 flex flex-col lg:flex-row gap-12">
                  
                  {/* Left Column: Platform Cards */}
                  <div className="w-[300px] flex flex-col gap-3 flex-shrink-0">
                    <Link href="#" className="flex items-center justify-between p-3 border border-gray-200 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-black dark:text-white">
                           <FiBox className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="text-[14px] font-semibold text-black dark:text-white leading-tight">Browser Extension</h5>
                          <p className="text-[12px] text-gray-500 mt-0.5">Supports Chrome</p>
                        </div>
                      </div>
                      <FiArrowUpRight className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4" />
                    </Link>

                    <Link href="/dashboard" className="flex items-center justify-between p-3 border border-gray-200 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-black dark:text-white">
                           <FiGlobe className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="text-[14px] font-semibold text-black dark:text-white leading-tight">Web App</h5>
                          <p className="text-[12px] text-gray-500 mt-0.5">Open in browser</p>
                        </div>
                      </div>
                      <FiArrowUpRight className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4" />
                    </Link>

                    <Link href="#" className="flex items-center justify-between p-3 border border-gray-200 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-black dark:text-white">
                           <FiSmartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="text-[14px] font-semibold text-black dark:text-white leading-tight">Mobile Apps</h5>
                          <p className="text-[12px] text-gray-500 mt-0.5">iOS and Android</p>
                        </div>
                      </div>
                      <FiArrowUpRight className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4" />
                    </Link>
                  </div>

                  {/* Right Columns Grid */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* AI Chat */}
                    <div className="space-y-4">
                      <h4 className="text-[15px] font-semibold text-black dark:text-white mb-6">AI Chat</h4>
                      <ul className="space-y-4">
                        <li><Link href="/chat" className="text-[13.5px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium block transition-colors">Chat with {PLATFORM_NAME.toUpperCase()}</Link></li>
                      </ul>
                    </div>

                    {/* Productivity */}
                    <div className="space-y-4">
                      <h4 className="text-[15px] font-semibold text-black dark:text-white mb-6">Productivity</h4>
                      <ul className="space-y-4">
                        <li>
                          <span className="text-[13.5px] text-gray-400 dark:text-zinc-600 font-medium flex items-center gap-2 cursor-not-allowed">
                            AI-first ERP <span className="text-[9px] bg-yellow-400 text-black px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter leading-none">Soon</span>
                          </span>
                        </li>
                        <li><Link href="#" className="text-[13.5px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium block transition-colors">TenderAssist</Link></li>
                        <li><Link href="#" className="text-[13.5px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium block transition-colors">Telephony</Link></li>
                      </ul>
                    </div>

                    {/* Tools */}
                    <div className="space-y-4">
                      <h4 className="text-[15px] font-semibold text-black dark:text-white mb-6">Tools</h4>
                      <ul className="space-y-4">
                        <li><Link href="#" className="text-[13.5px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium block transition-colors">FraudDetector</Link></li>
                        <li><Link href="#" className="text-[13.5px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium block transition-colors">LoanMan</Link></li>
                        <li><Link href="#" className="text-[13.5px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium block transition-colors">Tenders</Link></li>
                        <li><Link href="#" className="text-[13.5px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium block transition-colors">Funding</Link></li>
                      </ul>
                    </div>

                    {/* Summary */}
                    <div className="space-y-4">
                      <h4 className="text-[15px] font-semibold text-black dark:text-white mb-6">Summary</h4>
                      <ul className="space-y-4">
                        <li><Link href="#" className="text-[13.5px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium block transition-colors">YouTube Summarizer</Link></li>
                        <li><Link href="#" className="text-[13.5px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium block transition-colors">Article Summarizer</Link></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Link href="#pricing" className="text-[14px] font-semibold text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white px-3 py-1.5 rounded-md hover:bg-white/8 dark:hover:bg-white/8 transition-all">Pricing</Link>
            <Link href="/affiliate" className="text-[14px] font-semibold text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white px-3 py-1.5 rounded-md hover:bg-white/8 dark:hover:bg-white/8 transition-all">Affiliate</Link>
            <Link href="/teams" className="text-[14px] font-semibold text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white px-3 py-1.5 rounded-md hover:bg-white/8 dark:hover:bg-white/8 transition-all">Teams</Link>
            <Link href="/chat" className="text-[14px] font-semibold text-white dark:text-white bg-zinc-700 dark:bg-zinc-700 hover:bg-zinc-600 dark:hover:bg-zinc-600 px-3 py-1.5 rounded-md transition-all">Chat with {PLATFORM_NAME.toUpperCase()}</Link>
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="https://chromewebstore.google.com/"
              target="_blank"
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-800 text-black dark:text-white border border-gray-200 dark:border-zinc-700 rounded-md text-[13px] font-medium hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all"
            >
              <Image
                src="https://cdn.getmerlin.in/cms/Chrome_Web_Store_icon_5e2d8a5a4f.svg"
                alt="Chrome"
                width={16}
                height={16}
              />
              Add {PLATFORM_NAME.toUpperCase()} Extension
            </Link>
            <ThemeToggle className="text-zinc-500 hover:text-black dark:hover:text-white" />
            {user ? (
              <Link href="/dashboard" className="px-4 py-1.5 text-black dark:text-white text-[13px] font-medium hover:text-gray-500 dark:hover:text-gray-300 transition-all">
                Dashboard
              </Link>
            ) : (
              <Link href={loginUrl} className="px-4 py-1.5 text-black dark:text-white text-[13px] font-medium hover:text-gray-500 dark:hover:text-gray-300 transition-all">
                Log in
              </Link>
            )}
          </div>

          {/* Mobile Button */}
          <button className="lg:hidden text-black dark:text-white p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FiX size={26} /> : <FiMenu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white/90 dark:bg-black/90 backdrop-blur-xl z-40 p-6 space-y-4 overflow-y-auto">
          <div className="flex justify-between items-center py-4 border-b border-gray-200 dark:border-white/5">
            <span className="text-2xl font-bold text-black dark:text-white">Menu</span>
            <ThemeToggle />
          </div>
          <Link href="/chat" className="block text-2xl font-bold text-black dark:text-white py-4 border-b border-gray-200 dark:border-white/5">Product</Link>
          <Link href="#pricing" className="block text-2xl font-bold text-black dark:text-white py-4 border-b border-gray-200 dark:border-white/5">Pricing</Link>
          <Link href="/affiliate" className="block text-2xl font-bold text-black dark:text-white py-4 border-b border-gray-200 dark:border-white/5">Affiliate</Link>
          <Link href="/teams" className="block text-2xl font-bold text-black dark:text-white py-4 border-b border-gray-200 dark:border-white/5">Teams</Link>
          <div className="pt-8 space-y-4 pb-20">
            {user ? (
              <Link href="/dashboard" className="block text-xl font-bold text-black dark:text-white text-center py-4 bg-gray-100 dark:bg-zinc-900 rounded-2xl">Dashboard</Link>
            ) : (
              <Link href={loginUrl} className="block text-xl font-bold text-black dark:text-white text-center py-4 bg-gray-100 dark:bg-zinc-900 rounded-2xl">Log in</Link>
            )}
            <Link href="https://chromewebstore.google.com/" target="_blank" className="block text-xl font-bold text-white text-center py-4 bg-[#4f46e5] rounded-2xl">Add {PLATFORM_NAME.toUpperCase()} Extension</Link>
          </div>
        </div>
      )}
    </header>
  );
}
