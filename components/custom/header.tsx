"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { FiMenu, FiX, FiChevronDown } from "react-icons/fi";
import { Branding } from "./branding";
import { ThemeToggle } from "./theme-toggle";
import { BrandLogo } from "./brand-logo";

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
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-gray-100 dark:border-zinc-800 transition-all duration-300">
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
                <Branding showBadge={true} />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {!isLoginPage && !isRegisterPage && (
                <>
                  <div className="relative group">
                    <button className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white transition-colors py-2">
                      <span>Product</span>
                      <FiChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                    </button>
                    {/* Simplified Dropdown Mock */}
                    <div className="absolute top-full left-0 w-48 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-800 p-2">
                        <Link
                          href="/features"
                          className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white rounded-lg"
                        >
                          Features
                        </Link>
                        <Link
                          href="/ai-chat"
                          className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white rounded-lg"
                        >
                          AI Chat
                        </Link>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="#pricing"
                    className="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/affiliate"
                    className="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white transition-colors"
                  >
                    Affiliate
                  </Link>
                  <Link
                    href="/teams"
                    className="text-sm font-medium text-gray-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white transition-colors"
                  >
                    Teams
                  </Link>
                </>
              )}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />

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
                  {!isLoginPage && (
                    <button
                      onClick={openLoginPopup}
                      className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors px-2"
                    >
                      Log in
                    </button>
                  )}

                  {!isRegisterPage && (
                    <Link
                      href={signupUrl || "/register"}
                      className="text-sm font-semibold px-6 py-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-95"
                    >
                      {isLoginPage ? "Create account" : "Start Now"}
                    </Link>
                  )}
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
                  Product
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
              {!isLoginPage && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    openLoginPopup && openLoginPopup();
                  }}
                  className="w-full text-left px-4 py-3 text-base font-medium text-gray-600 dark:text-zinc-400"
                >
                  Log in
                </button>
              )}
              {!isRegisterPage && (
                <div className="px-4 pt-2">
                  <Link
                    href={signupUrl || "/register"}
                    className="block w-full px-5 py-3 bg-indigo-600 text-white text-center font-semibold rounded-xl hover:bg-indigo-700 shadow-md"
                    onClick={() => setIsOpen(false)}
                  >
                    {isLoginPage ? "Create account" : "Start Now"}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
