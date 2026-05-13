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
    <header className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-white/5 transition-all duration-300">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-3">
              <BrandLogo width={36} height={36} />
              <Branding showBadge={true} forceWhite={true} />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-10 h-full static">
            <div
              className="h-full flex items-center"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <button className="flex items-center gap-1.5 text-[15px] font-bold text-gray-400 hover:text-white transition-colors h-full px-2">
                Product <FiChevronDown className={`transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega Menu Overlay */}
              <div
                className={`absolute top-20 left-0 right-0 w-full bg-[#0a0a0a] border-b border-white/5 p-12 shadow-[0_40px_100px_rgba(0,0,0,0.8)] transition-all duration-300 z-50 ${isMegaMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-4'}`}
              >
                <div className="max-w-screen-2xl mx-auto grid grid-cols-5 gap-12 px-6 md:px-12">
                  {/* Platforms */}
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Platforms</h4>
                    <ul className="space-y-4">
                      <li><Link href="#" className="text-gray-400 hover:text-white font-medium block">Chrome Extension</Link></li>
                      <li><Link href="#" className="text-gray-400 hover:text-white font-medium block">Edge Extension</Link></li>
                      <li><Link href="#" className="text-gray-400 hover:text-white font-medium block">Android App</Link></li>
                      <li><Link href="#" className="text-gray-400 hover:text-white font-medium block">iOS App</Link></li>
                    </ul>
                  </div>
                  {/* AI Chat */}
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">AI Chat</h4>
                    <ul className="space-y-4">
                      <li><Link href="/chat" className="text-gray-400 hover:text-white font-medium block">Chat with {PLATFORM_NAME}</Link></li>
                      <li><Link href="#" className="text-gray-400 hover:text-white font-medium block">Free GPT-4o</Link></li>
                      <li><Link href="#" className="text-gray-400 hover:text-white font-medium block">Chat with Web Access</Link></li>
                      <li><Link href="#" className="text-gray-400 hover:text-white font-medium block">Chat with PDF</Link></li>
                    </ul>
                  </div>
                  {/* Productivity */}
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Productivity</h4>
                    <ul className="space-y-4">
                      <li><Link href="#" className="text-gray-400 hover:text-white font-medium block">AI for Google</Link></li>
                      <li><Link href="#" className="text-gray-400 hover:text-white font-medium block">AI for LinkedIn</Link></li>
                      <li><Link href="#" className="text-gray-400 hover:text-white font-medium block">AI for Twitter</Link></li>
                      <li><Link href="#" className="text-gray-400 hover:text-white font-medium block">Email Writer</Link></li>
                    </ul>
                  </div>
                  {/* AI Tools */}
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">AI Tools</h4>
                    <ul className="space-y-4">
                      <li><Link href="#" className="text-gray-400 hover:text-white font-medium block">AI Detector</Link></li>
                      <li><Link href="#" className="text-gray-400 hover:text-white font-medium block">Plagiarism Checker</Link></li>
                      <li><Link href="#" className="text-gray-400 hover:text-white font-medium block">AI Translator</Link></li>
                      <li><Link href="#" className="text-gray-400 hover:text-white font-medium block">AI Essay Writer</Link></li>
                    </ul>
                  </div>
                  {/* Summary */}
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Summary</h4>
                    <ul className="space-y-4">
                      <li><Link href="#" className="text-gray-400 hover:text-white font-medium block">YouTube Summarizer</Link></li>
                      <li><Link href="#" className="text-gray-400 hover:text-white font-medium block">Article Summarizer</Link></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <Link href="#pricing" className="text-[15px] font-bold text-gray-400 hover:text-white transition-colors">Pricing</Link>
            <Link href="/affiliate" className="text-[15px] font-bold text-gray-400 hover:text-white transition-colors">Affiliate</Link>
            <Link href="/teams" className="text-[15px] font-bold text-gray-400 hover:text-white transition-colors">Teams</Link>
            <Link href="/chat" className="text-[15px] font-bold text-gray-400 hover:text-white transition-colors">Chat with {PLATFORM_NAME}</Link>
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-6">
            <ThemeToggle className="text-zinc-400 hover:text-white" />
            <Link
              href="https://chromewebstore.google.com/"
              target="_blank"
              className="flex items-center gap-2 px-6 py-2.5 bg-[#4f46e5] text-white rounded-full text-sm font-bold hover:bg-[#4338ca] transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              <Image
                src="https://cdn.getmerlin.in/cms/Chrome_Web_Store_icon_5e2d8a5a4f.svg"
                alt="Chrome"
                width={20}
                height={20}
              />
              Add to Chrome
            </Link>
            {user ? (
               <Link
                href="/dashboard"
                className="text-[15px] font-bold text-white hover:text-gray-300 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href={loginUrl}
                className="text-[15px] font-bold text-white hover:text-gray-300 transition-colors"
              >
                Log in
              </Link>
            )}
          </div>

          {/* Mobile Button */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-20 bg-black z-40 p-6 space-y-4 overflow-y-auto">
          <div className="flex justify-between items-center py-4 border-b border-white/5">
            <span className="text-2xl font-bold text-white">Menu</span>
            <ThemeToggle />
          </div>
          <Link href="/chat" className="block text-2xl font-bold text-white py-4 border-b border-white/5">Product</Link>
          <Link href="#pricing" className="block text-2xl font-bold text-white py-4 border-b border-white/5">Pricing</Link>
          <Link href="/affiliate" className="block text-2xl font-bold text-white py-4 border-b border-white/5">Affiliate</Link>
          <Link href="/teams" className="block text-2xl font-bold text-white py-4 border-b border-white/5">Teams</Link>
          <div className="pt-8 space-y-4 pb-20">
             {user ? (
                <Link href="/dashboard" className="block text-xl font-bold text-white text-center py-4 bg-zinc-900 rounded-2xl">Dashboard</Link>
             ) : (
                <Link href={loginUrl} className="block text-xl font-bold text-white text-center py-4 bg-zinc-900 rounded-2xl">Log in</Link>
             )}
             <Link href="https://chromewebstore.google.com/" target="_blank" className="block text-xl font-bold text-white text-center py-4 bg-[#4f46e5] rounded-2xl">Add to Chrome</Link>
          </div>
        </div>
      )}
    </header>
  );
}
