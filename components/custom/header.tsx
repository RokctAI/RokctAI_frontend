/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiChevronRight,
  FiChevronDown,
  FiMenu,
  FiX,
  FiBox,
  FiGlobe,
  FiSmartphone,
  FiArrowUpRight,
} from "react-icons/fi";
import { Branding } from "./branding";
import { BrandLogo } from "./brand-logo";
import { ThemeToggle } from "./theme-toggle";
import { PLATFORM_NAME, getBrandingSync } from "@/app/config/platform";
import { PLATFORM_FEATURES } from "@/app/config/features";
import t from "@/app/lib/i18n";

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
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setBranding(getBrandingSync());
    const timer = setTimeout(() => setLogoCollapsed(true), 1500);
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // nav is visible when: logo hasn't collapsed yet, OR user is hovering/scrolling
  const navVisible = !logoCollapsed || isHovered || isScrolled;

  const user = session?.user;

  // Premium styled dynamic badges helper (accepts numeric ID)
  const renderBadge = (id: number) => {
    const label = PLATFORM_FEATURES[id]?.label;
    if (!label || label === "none") return null;

    if (label === "soon") {
      return (
        <span className="text-[9px] bg-yellow-400 text-black px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter leading-none shrink-0">
          {t("common.soon")}
        </span>
      );
    }

    if (label === "new") {
      return (
        <span className="text-[9px] bg-yellow-400 text-black px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter leading-none shrink-0">
          {t("common.new")}
        </span>
      );
    }

    return null;
  };

  return (
    <header
      className="fixed w-full top-0 z-50 bg-white/5 dark:bg-black/5 backdrop-blur-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <div className="relative flex items-center h-[44px]">
                <BrandLogo width={44} height={44} showBadge={true} />
                {/* Country code appears next to logo when collapsed */}
                <div
                  className="transition-all duration-500 overflow-hidden flex items-start whitespace-nowrap"
                  style={{
                    maxWidth: logoCollapsed
                      ? branding?.code
                        ? "120px"
                        : "0px"
                      : "0px",
                    height: "44px",
                    opacity: logoCollapsed ? 1 : 0,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      transition: "all 0.5s ease-in-out",
                      alignSelf: "flex-start",
                      marginTop: "-2px",
                      fontSize: "36px",
                      fontWeight: 500,
                      marginLeft: "4px",
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
                style={{
                  width: logoCollapsed ? "0px" : "250px",
                  opacity: logoCollapsed ? 0 : 1,
                }}
              >
                <div
                  className="pl-2 flex items-center"
                  style={{ paddingTop: "2px" }}
                >
                  <Branding
                    showBadge={false}
                    className="text-[60px] tracking-tighter leading-none"
                  />
                </div>
              </div>
            </Link>
            {/* Chevron shown only when logo is collapsed */}
            <span
              className="transition-all duration-500 text-zinc-400 dark:text-zinc-600 ml-1"
              style={{ opacity: logoCollapsed ? 1 : 0, pointerEvents: "none" }}
            >
              <FiChevronRight size={14} />
            </span>
          </div>

          {/* Desktop Nav — fades when collapsed, reappears on hover/scroll */}
          <nav
            className="hidden lg:flex items-center gap-1 h-full transition-all duration-500"
            style={{
              opacity: navVisible ? 1 : 0,
              pointerEvents: navVisible ? "auto" : "none",
            }}
          >
            {/* Product dropdown */}
            <div
              className="relative flex items-center h-full"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <button
                className={`flex items-center gap-1.5 text-[14px] font-semibold px-3 py-1.5 rounded-md transition-all ${isMegaMenuOpen ? "bg-white/10 dark:bg-white/10 text-black dark:text-white" : "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-white/8 dark:hover:bg-white/8"}`}
              >
                {t("header.product")}{" "}
                <FiChevronDown
                  className={`transition-transform duration-200 ${isMegaMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Mega Menu — anchored to the header bottom */}
              <div
                className={`fixed left-0 right-0 top-16 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.4)] transition-all duration-200 z-50 ${isMegaMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}
              >
                <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-8 flex flex-col lg:flex-row gap-12">
                  {/* Left Column: Platform Cards */}
                  {(PLATFORM_FEATURES[1]?.active ||
                    PLATFORM_FEATURES[2]?.active ||
                    PLATFORM_FEATURES[3]?.active) && (
                    <div className="w-[300px] flex flex-col gap-3 flex-shrink-0">
                      {PLATFORM_FEATURES[1]?.active && (
                        <Link
                          href={PLATFORM_FEATURES[1].href}
                          className="flex items-center justify-between p-3 border border-gray-200 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-black dark:text-white">
                              <FiBox className="w-5 h-5" />
                            </div>
                            <div>
                              <h5 className="text-[14px] font-semibold text-black dark:text-white leading-tight flex items-center gap-2">
                                {t(PLATFORM_FEATURES[1].name)}
                                {renderBadge(1)}
                              </h5>
                              <p className="text-[12px] text-gray-500 mt-0.5">
                                {t("header.chrome_support")}
                              </p>
                            </div>
                          </div>
                          <FiArrowUpRight className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4" />
                        </Link>
                      )}

                      {PLATFORM_FEATURES[2]?.active && (
                        <Link
                          href={PLATFORM_FEATURES[2].href}
                          className="flex items-center justify-between p-3 border border-gray-200 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-black dark:text-white">
                              <FiGlobe className="w-5 h-5" />
                            </div>
                            <div>
                              <h5 className="text-[14px] font-semibold text-black dark:text-white leading-tight flex items-center gap-2">
                                {t(PLATFORM_FEATURES[2].name)}
                                {renderBadge(2)}
                              </h5>
                              <p className="text-[12px] text-gray-500 mt-0.5">
                                {t("header.browser_support")}
                              </p>
                            </div>
                          </div>
                          <FiArrowUpRight className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4" />
                        </Link>
                      )}

                      {PLATFORM_FEATURES[3]?.active && (
                        <Link
                          href={PLATFORM_FEATURES[3].href}
                          className="flex items-center justify-between p-3 border border-gray-200 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-black dark:text-white">
                              <FiSmartphone className="w-5 h-5" />
                            </div>
                            <div>
                              <h5 className="text-[14px] font-semibold text-black dark:text-white leading-tight flex items-center gap-2">
                                {t(PLATFORM_FEATURES[3].name)}
                                {renderBadge(3)}
                              </h5>
                              <p className="text-[12px] text-gray-500 mt-0.5">
                                {t("header.mobile_support")}
                              </p>
                            </div>
                          </div>
                          <FiArrowUpRight className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Right Columns Grid */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* AI Chat */}
                    {PLATFORM_FEATURES[4]?.active && (
                      <div className="space-y-4">
                        <h4 className="text-[15px] font-semibold text-black dark:text-white mb-6">
                          {t("header.ai_chat")}
                        </h4>
                        <ul className="space-y-4">
                          <li>
                            {PLATFORM_FEATURES[4].label === "soon" ? (
                              <span className="text-[13.5px] text-gray-400 dark:text-zinc-600 font-medium flex items-center gap-2 cursor-not-allowed">
                                {t(PLATFORM_FEATURES[4].name)}
                                {renderBadge(4)}
                              </span>
                            ) : (
                              <Link
                                href={PLATFORM_FEATURES[4].href}
                                className="text-[13.5px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium block transition-colors flex items-center gap-2"
                              >
                                {t(PLATFORM_FEATURES[4].name)}
                                {renderBadge(4)}
                              </Link>
                            )}
                          </li>
                        </ul>
                      </div>
                    )}

                    {/* Productivity */}
                    {(PLATFORM_FEATURES[5]?.active ||
                      PLATFORM_FEATURES[6]?.active ||
                      PLATFORM_FEATURES[7]?.active) && (
                      <div className="space-y-4">
                        <h4 className="text-[15px] font-semibold text-black dark:text-white mb-6">
                          {t("header.productivity")}
                        </h4>
                        <ul className="space-y-4">
                          {PLATFORM_FEATURES[5]?.active && (
                            <li>
                              {PLATFORM_FEATURES[5].label === "soon" ? (
                                <span className="text-[13.5px] text-gray-400 dark:text-zinc-600 font-medium flex items-center gap-2 cursor-not-allowed">
                                  {t(PLATFORM_FEATURES[5].name)}
                                  {renderBadge(5)}
                                </span>
                              ) : (
                                <Link
                                  href={PLATFORM_FEATURES[5].href}
                                  className="text-[13.5px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium block transition-colors flex items-center gap-2"
                                >
                                  {t(PLATFORM_FEATURES[5].name)}
                                  {renderBadge(5)}
                                </Link>
                              )}
                            </li>
                          )}
                          {PLATFORM_FEATURES[6]?.active && (
                            <li>
                              {PLATFORM_FEATURES[6].label === "soon" ? (
                                <span className="text-[13.5px] text-gray-400 dark:text-zinc-600 font-medium flex items-center gap-2 cursor-not-allowed">
                                  {t(PLATFORM_FEATURES[6].name)}
                                  {renderBadge(6)}
                                </span>
                              ) : (
                                <Link
                                  href={PLATFORM_FEATURES[6].href}
                                  className="text-[13.5px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium block transition-colors flex items-center gap-2"
                                >
                                  {t(PLATFORM_FEATURES[6].name)}
                                  {renderBadge(6)}
                                </Link>
                              )}
                            </li>
                          )}
                          {PLATFORM_FEATURES[7]?.active && (
                            <li>
                              {PLATFORM_FEATURES[7].label === "soon" ? (
                                <span className="text-[13.5px] text-gray-400 dark:text-zinc-600 font-medium flex items-center gap-2 cursor-not-allowed">
                                  {t(PLATFORM_FEATURES[7].name)}
                                  {renderBadge(7)}
                                </span>
                              ) : (
                                <Link
                                  href={PLATFORM_FEATURES[7].href}
                                  className="text-[13.5px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium block transition-colors flex items-center gap-2"
                                >
                                  {t(PLATFORM_FEATURES[7].name)}
                                  {renderBadge(7)}
                                </Link>
                              )}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Tools */}
                    {(PLATFORM_FEATURES[8]?.active ||
                      PLATFORM_FEATURES[9]?.active ||
                      PLATFORM_FEATURES[10]?.active ||
                      PLATFORM_FEATURES[11]?.active) && (
                      <div className="space-y-4">
                        <h4 className="text-[15px] font-semibold text-black dark:text-white mb-6">
                          {t("header.tools")}
                        </h4>
                        <ul className="space-y-4">
                          {PLATFORM_FEATURES[8]?.active && (
                            <li>
                              {PLATFORM_FEATURES[8].label === "soon" ? (
                                <span className="text-[13.5px] text-gray-400 dark:text-zinc-600 font-medium flex items-center gap-2 cursor-not-allowed">
                                  {t(PLATFORM_FEATURES[8].name)}
                                  {renderBadge(8)}
                                </span>
                              ) : (
                                <Link
                                  href={PLATFORM_FEATURES[8].href}
                                  className="text-[13.5px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium block transition-colors flex items-center gap-2"
                                >
                                  {t(PLATFORM_FEATURES[8].name)}
                                  {renderBadge(8)}
                                </Link>
                              )}
                            </li>
                          )}
                          {PLATFORM_FEATURES[9]?.active && (
                            <li>
                              {PLATFORM_FEATURES[9].label === "soon" ? (
                                <span className="text-[13.5px] text-gray-400 dark:text-zinc-600 font-medium flex items-center gap-2 cursor-not-allowed">
                                  {t(PLATFORM_FEATURES[9].name)}
                                  {renderBadge(9)}
                                </span>
                              ) : (
                                <Link
                                  href={PLATFORM_FEATURES[9].href}
                                  className="text-[13.5px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium block transition-colors flex items-center gap-2"
                                >
                                  {t(PLATFORM_FEATURES[9].name)}
                                  {renderBadge(9)}
                                </Link>
                              )}
                            </li>
                          )}
                          {PLATFORM_FEATURES[10]?.active && (
                            <li>
                              {PLATFORM_FEATURES[10].label === "soon" ? (
                                <span className="text-[13.5px] text-gray-400 dark:text-zinc-600 font-medium flex items-center gap-2 cursor-not-allowed">
                                  {t(PLATFORM_FEATURES[10].name)}
                                  {renderBadge(10)}
                                </span>
                              ) : (
                                <Link
                                  href={PLATFORM_FEATURES[10].href}
                                  className="text-[13.5px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium block transition-colors flex items-center gap-2"
                                >
                                  {t(PLATFORM_FEATURES[10].name)}
                                  {renderBadge(10)}
                                </Link>
                              )}
                            </li>
                          )}
                          {PLATFORM_FEATURES[11]?.active && (
                            <li>
                              {PLATFORM_FEATURES[11].label === "soon" ? (
                                <span className="text-[13.5px] text-gray-400 dark:text-zinc-600 font-medium flex items-center gap-2 cursor-not-allowed">
                                  {t(PLATFORM_FEATURES[11].name)}
                                  {renderBadge(11)}
                                </span>
                              ) : (
                                <Link
                                  href={PLATFORM_FEATURES[11].href}
                                  className="text-[13.5px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium block transition-colors flex items-center gap-2"
                                >
                                  {t(PLATFORM_FEATURES[11].name)}
                                  {renderBadge(11)}
                                </Link>
                              )}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Summary */}
                    {(PLATFORM_FEATURES[12]?.active ||
                      PLATFORM_FEATURES[13]?.active) && (
                      <div className="space-y-4">
                        <h4 className="text-[15px] font-semibold text-black dark:text-white mb-6">
                          {t("header.summary")}
                        </h4>
                        <ul className="space-y-4">
                          {PLATFORM_FEATURES[12]?.active && (
                            <li>
                              {PLATFORM_FEATURES[12].label === "soon" ? (
                                <span className="text-[13.5px] text-gray-400 dark:text-zinc-600 font-medium flex items-center gap-2 cursor-not-allowed">
                                  {t(PLATFORM_FEATURES[12].name)}
                                  {renderBadge(12)}
                                </span>
                              ) : (
                                <Link
                                  href={PLATFORM_FEATURES[12].href}
                                  className="text-[13.5px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium block transition-colors flex items-center gap-2"
                                >
                                  {t(PLATFORM_FEATURES[12].name)}
                                  {renderBadge(12)}
                                </Link>
                              )}
                            </li>
                          )}
                          {PLATFORM_FEATURES[13]?.active && (
                            <li>
                              {PLATFORM_FEATURES[13].label === "soon" ? (
                                <span className="text-[13.5px] text-gray-400 dark:text-zinc-600 font-medium flex items-center gap-2 cursor-not-allowed">
                                  {t(PLATFORM_FEATURES[13].name)}
                                  {renderBadge(13)}
                                </span>
                              ) : (
                                <Link
                                  href={PLATFORM_FEATURES[13].href}
                                  className="text-[13.5px] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium block transition-colors flex items-center gap-2"
                                >
                                  {t(PLATFORM_FEATURES[13].name)}
                                  {renderBadge(13)}
                                </Link>
                              )}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {PLATFORM_FEATURES[14]?.active && (
              <Link
                href={PLATFORM_FEATURES[14].href}
                className="text-[14px] font-semibold text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white px-3 py-1.5 rounded-md hover:bg-white/8 dark:hover:bg-white/8 transition-all flex items-center gap-1.5"
              >
                {t(PLATFORM_FEATURES[14].name)}
                {renderBadge(14)}
              </Link>
            )}
            {PLATFORM_FEATURES[15]?.active && (
              <Link
                href={PLATFORM_FEATURES[15].href}
                className="text-[14px] font-semibold text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white px-3 py-1.5 rounded-md hover:bg-white/8 dark:hover:bg-white/8 transition-all flex items-center gap-1.5"
              >
                {t(PLATFORM_FEATURES[15].name)}
                {renderBadge(15)}
              </Link>
            )}
            {PLATFORM_FEATURES[16]?.active && (
              <Link
                href={PLATFORM_FEATURES[16].href}
                className="text-[14px] font-semibold text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white px-3 py-1.5 rounded-md hover:bg-white/8 dark:hover:bg-white/8 transition-all flex items-center gap-1.5"
              >
                {t(PLATFORM_FEATURES[16].name)}
                {renderBadge(16)}
              </Link>
            )}
            {PLATFORM_FEATURES[17]?.active && (
              <Link
                href={PLATFORM_FEATURES[17].href}
                className="text-[14px] font-semibold text-white dark:text-white bg-zinc-700 dark:bg-zinc-700 hover:bg-zinc-600 dark:hover:bg-zinc-600 px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5"
              >
                {t(PLATFORM_FEATURES[17].name)}
                {renderBadge(17)}
              </Link>
            )}
          </nav>

          {/* Actions — always visible */}
          <div className="hidden lg:flex items-center gap-4">
            {PLATFORM_FEATURES[1]?.active && (
              <Link
                href={PLATFORM_FEATURES[1].href}
                target="_blank"
                className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400 text-black rounded-md text-[13px] font-medium hover:bg-yellow-300 transition-all"
              >
                <Image
                  src="https://cdn.getmerlin.in/cms/Chrome_Web_Store_icon_5e2d8a5a4f.svg"
                  alt="Chrome"
                  width={16}
                  height={16}
                />
                {t("header.add_extension", {
                  platform: PLATFORM_NAME.toUpperCase(),
                })}
              </Link>
            )}
            <ThemeToggle className="text-zinc-500 hover:text-black dark:hover:text-white" />
            {user ? (
              <Link
                href="/dashboard"
                className="px-4 py-1.5 text-black dark:text-white text-[13px] font-medium border border-gray-200 dark:border-zinc-700 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
              >
                {t("common.dashboard")}
              </Link>
            ) : (
              <Link
                href={loginUrl}
                className="px-4 py-1.5 text-black dark:text-white text-[13px] font-medium border border-gray-200 dark:border-zinc-700 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
              >
                {t("auth.login")}
              </Link>
            )}
          </div>

          {/* Mobile Button */}
          <button
            className="lg:hidden text-black dark:text-white p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FiX size={26} /> : <FiMenu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white/90 dark:bg-black/90 backdrop-blur-xl z-40 p-6 space-y-4 overflow-y-auto">
          <div className="flex justify-between items-center py-4 border-b border-gray-200 dark:border-white/5">
            <span className="text-2xl font-bold text-black dark:text-white">
              {t("header.menu")}
            </span>
            <ThemeToggle />
          </div>
          {PLATFORM_FEATURES[4]?.active && (
            <Link
              href={PLATFORM_FEATURES[4].href}
              className="block text-2xl font-bold text-black dark:text-white py-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between"
            >
              <span>{t(PLATFORM_FEATURES[4].name)}</span>
              {renderBadge(4)}
            </Link>
          )}
          {PLATFORM_FEATURES[14]?.active && (
            <Link
              href={PLATFORM_FEATURES[14].href}
              className="block text-2xl font-bold text-black dark:text-white py-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between"
            >
              <span>{t(PLATFORM_FEATURES[14].name)}</span>
              {renderBadge(14)}
            </Link>
          )}
          {PLATFORM_FEATURES[15]?.active && (
            <Link
              href={PLATFORM_FEATURES[15].href}
              className="block text-2xl font-bold text-black dark:text-white py-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between"
            >
              <span>{t(PLATFORM_FEATURES[15].name)}</span>
              {renderBadge(15)}
            </Link>
          )}
          {PLATFORM_FEATURES[16]?.active && (
            <Link
              href={PLATFORM_FEATURES[16].href}
              className="block text-2xl font-bold text-black dark:text-white py-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between"
            >
              <span>{t(PLATFORM_FEATURES[16].name)}</span>
              {renderBadge(16)}
            </Link>
          )}
          <div className="pt-8 space-y-4 pb-20">
            {user ? (
              <Link
                href="/dashboard"
                className="block text-xl font-bold text-black dark:text-white text-center py-4 bg-gray-100 dark:bg-zinc-900 rounded-2xl"
              >
                {t("common.dashboard")}
              </Link>
            ) : (
              <Link
                href={loginUrl}
                className="block text-xl font-bold text-black dark:text-white text-center py-4 bg-gray-100 dark:bg-zinc-900 rounded-2xl"
              >
                {t("auth.login")}
              </Link>
            )}
            {PLATFORM_FEATURES[1]?.active && (
              <Link
                href={PLATFORM_FEATURES[1].href}
                target="_blank"
                className="block text-xl font-bold text-white text-center py-4 bg-[#4f46e5] rounded-2xl"
              >
                Add{" "}
                {t("header.add_extension", {
                  platform: PLATFORM_NAME.toUpperCase(),
                })}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
