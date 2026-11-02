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

"use client";

// The header's Log in / Sign up pair (auth_sdk 1.11.0). Ray, 2026-11-01:
// "sites that have auth sdk i think they should get the login signup
// buttons in header", and "we just moving login and signup buttons to
// injection". base_sdk >= 1.60.0's header no longer draws the pair itself:
// it renders an empty slot (components/custom/header-auth-slot.tsx) that
// this file fills through the manifest integration at
// components/custom/landing/header-auth.ts (// @rokct-sdk-header-auth-start).
// A shell that composes auth_sdk gets the pair; one that does not gets
// none, and no link to a /login route it does not have.
//
// What it draws is what base's header drew until 1.60.0, word for word and
// class for class: on the bar a quiet "Log in" link and a "Sign up" pill,
// in the burger panel two large stacked buttons. A header passes its own
// `classes` (base's header passes exactly these; a home SDK's own header
// passes its design); without them the pair falls back to base's look.
// The auth pages' popup handlers run on a tap as before, and in the panel
// the tap closes the panel first. A local shell (`dataMode="local"`, no
// backend to sign in to) gets no pair: showsHeaderAuth, the 1.38.0 rule.

import Link from "next/link";
import React from "react";

import t from "@/app/lib/i18n";
import type { HeaderAuthProps } from "@/components/custom/landing/header-auth";
import { showsHeaderAuth } from "@/components/custom/landing/header-menu";

const STACKED_BUTTON =
  "block w-full rounded-2xl py-4 text-center text-lg font-bold transition-colors";

/** base_sdk's header pair, as it drew it until 1.60.0. */
export const HEADER_AUTH_DEFAULT_CLASSES = {
  bar: {
    login:
      "text-[13px] font-medium text-foreground/70 transition-colors hover:text-foreground",
    signup:
      "rounded-full bg-black px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black",
  },
  panel: {
    login: `${STACKED_BUTTON} bg-foreground/5 text-foreground`,
    signup: `${STACKED_BUTTON} bg-black text-white dark:bg-white dark:text-black`,
  },
} as const;

export default function HeaderAuthButtons({
  variant,
  loginUrl = "/login",
  signupUrl = "/register",
  openLoginPopup,
  openSignupPopup,
  onNavigate,
  dataMode,
  classes,
}: HeaderAuthProps) {
  if (!showsHeaderAuth(dataMode)) return null;
  const defaults = HEADER_AUTH_DEFAULT_CLASSES[variant];
  const loginClass = classes?.login ?? defaults.login;
  const signupClass = classes?.signup ?? defaults.signup;

  if (variant === "bar") {
    return (
      <>
        <Link href={loginUrl} onClick={openLoginPopup} className={loginClass}>
          {t("auth.login")}
        </Link>
        <Link
          href={signupUrl}
          onClick={openSignupPopup}
          className={signupClass}
        >
          {t("auth.signup")}
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href={loginUrl}
        onClick={() => {
          onNavigate?.();
          openLoginPopup?.();
        }}
        className={loginClass}
      >
        {t("auth.login")}
      </Link>
      <Link
        href={signupUrl}
        onClick={() => {
          onNavigate?.();
          openSignupPopup?.();
        }}
        className={signupClass}
      >
        {t("auth.signup")}
      </Link>
    </>
  );
}
