/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// agent_sdk 1.26.0: the rokct.ai frame for auth_sdk's pages (login,
// register, forgot-password). Ray: every app shell gets its own design for
// register and login (the pattern hosting_sdk 1.21.0 set for Cortex).
//
// auth_sdk >= 1.12.0 wraps those pages in SiteShell from this path and
// installs a generic default here. agent_sdk is RokctAI_frontend's home SDK,
// so the installer keeps this copy. The root carries RK_ROOT_CLASS, the
// landing's scope (rokct-landing.css) and its three font variables, so
// base's Header is drawn exactly as on the landing and the light and dark
// tokens follow next-themes' .dark class. The footer is not drawn here: the
// shell's root layout already renders its own Footer under every page.
// Presentation only: auth_sdk's views, actions and fields are untouched.
// Client-safe: it imports no server module.

"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import "@/components/custom/landing/rokct-landing.css";
import "@/components/custom/agent-auth/rokct-auth.css";

import { Header } from "@/components/custom/header";
import { RK_ROOT_CLASS } from "@/components/custom/landing/rokct-landing-classes";
import { RK_MARK } from "@/components/custom/landing/agent-header-menu";
import { ROKCT_AUTH_COPY, rokctAuthPanel } from "@/components/custom/agent-auth/rokct-auth-copy";

export interface SiteShellProps {
  children: ReactNode;
  /** Header "Log in" handler from the auth page, passed to base's Header. */
  openLoginPopup?: () => void;
  /** Header "Sign up" handler from the auth page, passed to base's Header. */
  openSignupPopup?: () => void;
}

export function SiteShell({ children, openLoginPopup, openSignupPopup }: SiteShellProps) {
  const panel = rokctAuthPanel(usePathname());
  return (
    <div className={`${RK_ROOT_CLASS} ra-root flex flex-col`}>
      <Header openLoginPopup={openLoginPopup} openSignupPopup={openSignupPopup} />
      <main className="ra">
        <div className="rk-wrap ra-g">
          <aside className="ra-side" aria-label={ROKCT_AUTH_COPY.sideLabel}>
            <p className="ra-h">
              {panel.title.map((line, i) => (
                <span key={line}>{i === panel.title.length - 1 ? <span className="rk-hl">{line}</span> : line}</span>
              ))}
            </p>
            <p className="ra-lede">{panel.lede}</p>
            <ul className="ra-pts">
              {ROKCT_AUTH_COPY.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </aside>
          <div className="ra-card">{children}</div>
        </div>
      </main>
    </div>
  );
}

/** The mark above the auth card: the yellow tile the landing's header shows. */
export function SiteShellLogo({ size = 56 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={RK_MARK} width={size} height={size} alt="" className="ra-mark" />;
}
