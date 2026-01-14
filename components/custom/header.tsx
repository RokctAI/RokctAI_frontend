"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { PLATFORM_NAME } from "@/app/config/platform";
import { Branding } from "./branding";

import { ThemeToggle } from "./theme-toggle";
import { BrandLogo } from "./brand-logo";

export function Header({
  openLoginPopup,
  openSignupPopup,
  loginUrl,
  signupUrl
}: {
  openLoginPopup?: () => void;
  openSignupPopup?: () => void;
  loginUrl?: string;
  signupUrl?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const { data: session } = useSession();
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <div className="w-full px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo Area */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative w-8 h-8 transition-transform duration-300 group-hover:scale-110">
                <BrandLogo width={32} height={32} className="object-contain" />
              </div>

              {/* Separator */}
              <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-700 mx-1" />

              {/* Logo Text & Badge */}
              <Branding showBadge={true} />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {!isLoginPage && !isRegisterPage && (
                <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                  Pricing
                </Link>
              )}

              {session ? (
                <>
                  <Link href="/paas/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      const siteName = (session as any)?.user?.siteName;
                      signOut({ callbackUrl: siteName ? `/?site_name=${siteName}` : "/" });
                    }}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                  <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-2" />
                </>
              ) : (
                <>
                  {/* On Register Page: Show Login Button */}
                  {/* On Landing Page: Show Login Button */}
                  {(!isLoginPage) && (
                    loginUrl ? (
                      <Link
                        href={loginUrl}
                        className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      >
                        Log in
                      </Link>
                    ) : (
                      <button
                        onClick={openLoginPopup}
                        className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                      >
                        Log in
                      </button>
                    )
                  )}

                  {/* On Login Page: Show Register Button */}
                  {/* On Landing Page: Show Get Started Button */}
                  {(!isRegisterPage) && (
                    signupUrl ? (
                      <Link
                        href={signupUrl}
                        className={`text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md
                              ${isLoginPage
                            ? "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
                            : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90"
                          }
                          `}
                      >
                        {isLoginPage ? "Create account" : "Start Now"}
                      </Link>
                    ) : (
                      <button
                        onClick={openSignupPopup}
                        className={`text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm hover:shadow-md
                              ${isLoginPage
                            ? "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700" // Secondary style for 'Register' on Login page
                            : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90" // Primary style for 'Get Started'
                          }
                          `}
                      >
                        {isLoginPage ? "Create account" : "Start Now"}
                      </button>
                    )
                  )}
                </>
              )}

              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-900 dark:text-gray-100 focus:outline-none p-2"
              >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 shadow-lg animate-in slide-in-from-top-5">
            <div className="container mx-auto px-4 pb-6 flex flex-col space-y-4 pt-4">
              {!isLoginPage && !isRegisterPage && (
                <Link href="#pricing" className="text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  Pricing
                </Link>
              )}

              {(!isLoginPage) && (
                loginUrl ? (
                  <Link
                    href={loginUrl}
                    className="text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-left"
                    onClick={() => setIsOpen(false)}
                  >
                    Log in
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      openLoginPopup && openLoginPopup();
                    }}
                    className="text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-left"
                  >
                    Log in
                  </button>
                )
              )}

              {(!isRegisterPage) && (
                signupUrl ? (
                  <Link
                    href={signupUrl}
                    className="text-base font-medium px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    {isLoginPage ? "Create account" : "Get Started"}
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      openSignupPopup && openSignupPopup();
                    }}
                    className="text-base font-medium px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-center"
                  >
                    {isLoginPage ? "Create account" : "Get Started"}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
