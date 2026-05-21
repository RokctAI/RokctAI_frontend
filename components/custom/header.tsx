"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import { Branding } from "./branding";
import { BrandLogo } from "./brand-logo";
import { ThemeToggle } from "./theme-toggle";
import { PLATFORM_NAME } from "@/app/config/platform";

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
  const pathname = usePathname();

  const user = session?.user;

  return (
    <header className="fixed w-full top-0 z-50 bg-white/10 dark:bg-black/10 backdrop-blur-2xl transition-all duration-300">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <BrandLogo width={32} height={32} showBadge={true} />
              <Branding showBadge={true} />
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
              <button className={`flex items-center gap-1.5 text-[14px] font-semibold px-4 py-2 rounded-full transition-all ${isMegaMenuOpen ? 'bg-white/15 dark:bg-white/10 text-black dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-white/10 dark:hover:bg-white/10'}`}>
                Product <FiChevronDown className={`transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega Menu — anchored to the header bottom */}
              <div
                className={`fixed left-0 right-0 top-16 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-white/10 dark:border-white/10 shadow-2xl transition-all duration-200 z-50 ${isMegaMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}
              >
                <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-10 grid grid-cols-5 gap-10">
                  {/* Platforms */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platforms</h4>
                    <ul className="space-y-3">
                      <li><Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium block transition-colors">Chrome Extension</Link></li>
                      <li><Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium block transition-colors">Edge Extension</Link></li>
                      <li><Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium block transition-colors">Android App</Link></li>
                      <li><Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium block transition-colors">iOS App</Link></li>
                    </ul>
                  </div>
                  {/* AI Chat */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">AI Chat</h4>
                    <ul className="space-y-3">
                      <li><Link href="/chat" className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium block transition-colors">Chat with {PLATFORM_NAME}</Link></li>
                    </ul>
                  </div>
                  {/* Productivity */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Productivity</h4>
                    <ul className="space-y-3">
                      <li>
                        <span className="text-sm text-gray-400 dark:text-zinc-600 font-medium flex items-center gap-2 cursor-not-allowed">
                          AI-first ERP <span className="text-[9px] bg-yellow-400 text-black px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter leading-none">Soon</span>
                        </span>
                      </li>
                      <li><Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:text-white font-medium block transition-colors">TenderAssist</Link></li>
                      <li><Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:text-white font-medium block transition-colors">Telephony</Link></li>
                    </ul>
                  </div>
                  {/* Tools */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tools</h4>
                    <ul className="space-y-3">
                      <li><Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:text-white font-medium block transition-colors">FraudDetector</Link></li>
                      <li><Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:text-white font-medium block transition-colors">LoanMan</Link></li>
                    </ul>
                  </div>
                  {/* Summary */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Summary</h4>
                    <ul className="space-y-3">
                      <li><Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium block transition-colors">YouTube Summarizer</Link></li>
                      <li><Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium block transition-colors">Article Summarizer</Link></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <Link href="#pricing" className="text-[14px] font-semibold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-white/10 dark:hover:bg-white/10 px-4 py-2 rounded-full transition-all">Pricing</Link>
            <Link href="/affiliate" className="text-[14px] font-semibold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-white/10 dark:hover:bg-white/10 px-4 py-2 rounded-full transition-all">Affiliate</Link>
            <Link href="/teams" className="text-[14px] font-semibold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-white/10 dark:hover:bg-white/10 px-4 py-2 rounded-full transition-all">Teams</Link>
            <Link href="/chat" className="text-[14px] font-semibold text-black dark:text-white bg-white/15 dark:bg-white/10 hover:bg-white/25 dark:hover:bg-white/20 px-4 py-2 rounded-full transition-all border border-white/20 dark:border-white/10">Chat with {PLATFORM_NAME}</Link>
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <ThemeToggle className="text-zinc-500 hover:text-black dark:hover:text-white" />
            <Link
              href="https://chromewebstore.google.com/"
              target="_blank"
              className="flex items-center gap-2 px-5 py-2 bg-[#4f46e5] text-white rounded-full text-sm font-bold hover:bg-[#4338ca] transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              <Image
                src="https://cdn.getmerlin.in/cms/Chrome_Web_Store_icon_5e2d8a5a4f.svg"
                alt="Chrome"
                width={18}
                height={18}
              />
              Add to Chrome
            </Link>
            {user ? (
              <Link href="/dashboard" className="text-[14px] font-bold text-black dark:text-white hover:text-gray-400 transition-colors">
                Dashboard
              </Link>
            ) : (
              <Link href={loginUrl} className="text-[14px] font-bold text-black dark:text-white hover:text-gray-400 transition-colors">
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
            <Link href="https://chromewebstore.google.com/" target="_blank" className="block text-xl font-bold text-white text-center py-4 bg-[#4f46e5] rounded-2xl">Add to Chrome</Link>
          </div>
        </div>
      )}
    </header>
  );
}
