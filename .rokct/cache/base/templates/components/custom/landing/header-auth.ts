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

// Auth registry for the header's Log in / Sign up slot (base_sdk 1.60.0).
//
// Ray, 2026-11-01: "sites that have auth sdk i think they should get the
// login signup buttons in header", and "we just moving login and signup
// buttons to injection". Until 1.60.0 the header drew the pair itself for
// every visitor with no session, so a shell composed without any sign-in
// surface showed two links to a /login route it does not have. Now the
// header carries an EMPTY slot (components/custom/header-auth-slot.tsx)
// and the SDK that owns sign-in fills it, the way a home SDK fills the
// hero form (./hero-form.ts): it installs a client component whose
// default export takes HeaderAuthProps and registers it with ONE line at
// the marker below through its manifest integrations:
//
//   { id: "<sdk>-header-auth", load: () => import("@/components/custom/<dir>/<file>") },
//
// Base never asks which SDK that is. With nothing registered the slot
// renders nothing, on the server and on the client, and the header shows
// no pair at all. The FIRST registered entry answers (one header, one
// pair). This marker is NOT a home-SDK-only registry: the SDK that owns
// sign-in is never the home SDK, so the protocol installer accepts any
// SDK's line here (it is not in sdk_installer_base.SINGLE_ANSWER_MARKERS).
//
// The same slot serves a header a home SDK owns itself (a studio or a
// product landing): it renders <HeaderAuthSlot variant=... classes=... />
// where its own sign-in controls belong and passes its own classes, so the
// registered pair takes that header's design.
//
// Entries between the markers below are injected by the Rokct SDK
// installer (sdk_installer_base.py update_integrations()), one
// self-contained line with a dynamic import each. Do not remove or
// reformat the marker comments inside the array literal.

import type { ComponentType } from "react";

import type { SiteDataMode } from "@/lib/site-data/kinds";

/** The classes a header gives the pair, so the buttons take its design. */
export type HeaderAuthClasses = {
  /** The "Log in" control. */
  login?: string;
  /** The "Sign up" control. */
  signup?: string;
};

/** What a header hands the registered pair. */
export type HeaderAuthProps = {
  /**
   * Where the pair is drawn: "bar" is the header's own row (desktop),
   * "panel" the burger or phone menu, where a tap also closes the panel.
   */
  variant: "bar" | "panel";
  /** The sign-in route. */
  loginUrl?: string;
  /** The sign-up route. */
  signupUrl?: string;
  /** The auth pages' handlers, run on a tap in place of a plain navigation. */
  openLoginPopup?: () => void;
  openSignupPopup?: () => void;
  /** Run on a tap before the handler: the panel closes itself. */
  onNavigate?: () => void;
  /** The shell's data mode, as the page read it (a local shell has no backend to sign in to). */
  dataMode?: SiteDataMode;
  /** The header's own classes for the two controls; absent, the pair draws base's header look. */
  classes?: HeaderAuthClasses;
};

export type HeaderAuthComponent = ComponentType<HeaderAuthProps>;

/** The shape of a registered pair's module. */
export type HeaderAuthModule = { default: HeaderAuthComponent };

export type HeaderAuthEntry = {
  /** Stable, unique across SDKs: "<sdk>-header-auth". */
  id: string;
  load: () => Promise<HeaderAuthModule>;
};

export const HEADER_AUTH: HeaderAuthEntry[] = [
  // @rokct-sdk-header-auth-start
  // @rokct-sdk-header-auth-end
];

/** Whether anything is registered: the header draws the slot (and offers its burger for it) only then. */
export function hasHeaderAuth(): boolean {
  return HEADER_AUTH.length > 0;
}

/**
 * Loads the first registered pair's component. An entry that fails to
 * load is logged and skipped in favour of the next one; null when nothing
 * is registered or nothing loads, and the slot then renders nothing.
 */
export async function loadHeaderAuth(): Promise<HeaderAuthComponent | null> {
  for (const entry of HEADER_AUTH) {
    try {
      return (await entry.load()).default;
    } catch (error) {
      console.error(
        `[header] failed to load header auth "${entry.id}":`,
        error,
      );
    }
  }
  return null;
}
