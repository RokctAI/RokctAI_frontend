"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { FiMenu, FiX, FiChevronDown } from "react-icons/fi";
import { Branding } from "./branding";
import { ThemeToggle } from "./theme-toggle";
import { BrandLogo } from "./brand-logo";
import { PLATFORM_NAME } from "@/app/config/platform";
import { Button } from "@/components/ui/button";

export function Header({
  openLoginPopup,
  openSignupPopup,
  loginUrl,
  signupUrl,
}: {
  openLoginPopup?: () => void;
  openSignupPopup?: () => void;
  loginUrl?: string;
  signupUrl?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo Area */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="relative w-8 h-8 transition-transform duration-300 group-hover:scale-105">
                  <BrandLogo
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{PLATFORM_NAME}</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {!isLoginPage && !isRegisterPage && (
                <>
                  <div className="relative group">
                    <button className="flex items-center space-x-1 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2">
                      <span>Product</span>
                      <FiChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                    </button>
                    <div className="absolute top-full left-0 w-64 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-800 p-2 grid gap-1">
                        <Link
                          href="/features"
                          className="flex flex-col px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg group/item"
                        >
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">Features</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Discover what {PLATFORM_NAME} can do</span>
                        </Link>
                        <Link
                          href="/ai-chat"
                          className="flex flex-col px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg group/item"
                        >
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">AI Chat</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Chat with the most advanced models</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="#pricing"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/affiliate"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Affiliate
                  </Link>
                  <Link
                    href="/teams"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Teams
                  </Link>
                </>
              )}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {session ? (
                <>
                  <Link
                    href="/paas/dashboard"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-sm font-medium px-4 py-2 text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800 rounded-full transition-colors"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <ThemeToggle />
                  <Link
                    href={loginUrl || "/login"}
                    className="text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-indigo-600 transition-colors px-2"
                  >
                    Log in
                  </Link>
                  <Link
                    href="https://chromewebstore.google.com/"
                    target="_blank"
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#4f46e5] text-white rounded-full text-sm font-bold hover:bg-[#4338ca] transition-all shadow-md hover:shadow-lg active:scale-95"
                  >
                    <Image
                      src="https://cdn.getmerlin.in/cms/Chrome_Web_Store_icon_5e2d8a5a4f.svg"
                      alt="Chrome"
                      width={18}
                      height={18}
                      className="brightness-0 invert"
                    />
                    Add to Chrome
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-900 dark:text-gray-100 focus:outline-none p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute top-full left-0 w-full bg-white dark:bg-black border-b border-gray-100 dark:border-zinc-800 shadow-xl transition-all duration-300 ease-in-out ${
            isOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <div className="px-4 pt-2 pb-8 space-y-2">
            {!isLoginPage && !isRegisterPage && (
              <>
                <Link
                  href="/features"
                  className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-xl"
                >
                  Features
                </Link>
                <Link
                  href="/ai-chat"
                  className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-xl"
                >
                  AI Chat
                </Link>
                <Link
                  href="#pricing"
                  className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-xl"
                >
                  Pricing
                </Link>
                <Link
                  href="/affiliate"
                  className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-xl"
                >
                  Affiliate
                </Link>
                <Link
                  href="/teams"
                  className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-xl"
                >
                  Teams
                </Link>
              </>
            )}

            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 mt-4">
              <Link
                href={loginUrl || "/login"}
                className="block w-full text-left px-4 py-3 text-base font-medium text-gray-600 dark:text-zinc-400"
              >
                Log in
              </Link>
              <div className="px-4 pt-2">
                <Link
                  href="https://chromewebstore.google.com/"
                  className="block w-full px-5 py-3 bg-[#4f46e5] text-white text-center font-semibold rounded-full hover:bg-[#4338ca] shadow-md"
                  onClick={() => setIsOpen(false)}
                >
                  Add to Chrome
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
