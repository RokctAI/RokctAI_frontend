// Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, version 3.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

// The frame the auth pages (login, register, forgot-password) sit in.
//
// This is auth_sdk's DEFAULT: base_sdk's generic Header above the page, as
// the pages drew it before 1.12.0. A home SDK replaces it by installing its
// own components/custom/site-shell.tsx with the same SiteShell export: the
// installer never lets a non-home SDK write a path the home SDK installs, so
// the home SDK's copy wins whatever the compose order, and a shell with no
// home SDK (or one that ships no shell) keeps this file.
//
// Contract for a replacement: export SiteShell taking SiteShellProps, render
// the children inside the site's own header and footer; export SiteShellLogo
// taking { size }, the mark above the card (the same one the site's header
// shows; return null to show none); and import nothing
// server-only (the login and register views are client components; the
// forgot-password page is a server one).

import type { ReactNode } from "react";

import { BrandLogo } from "@/components/custom/brand-logo";
import { Header } from "@/components/custom/header";

export interface SiteShellProps {
  children: ReactNode;
  /** Header "Log in" handler from the auth page; a shell may ignore it. */
  openLoginPopup?: () => void;
  /** Header "Sign up" handler from the auth page; a shell may ignore it. */
  openSignupPopup?: () => void;
}

export function SiteShell({ children, openLoginPopup, openSignupPopup }: SiteShellProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header openLoginPopup={openLoginPopup} openSignupPopup={openSignupPopup} />
      {children}
    </div>
  );
}

/** The mark above the auth card: the host's BrandLogo seam by default. */
export function SiteShellLogo({ size = 56 }: { size?: number }) {
  return <BrandLogo width={size} height={size} />;
}
