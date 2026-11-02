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

// The header's Log in / Sign up slot (base_sdk 1.60.0): it draws whatever
// the SDK that owns sign-in registered in ./landing/header-auth.ts, and
// nothing when nothing is registered. Base's own header renders it on its
// bar and in its burger panel; a header a home SDK owns renders it where
// its sign-in controls belong, with its own `classes`.
//
// The pattern is the header brand's and the hero form's: with nothing
// registered there is no loader at all, a static component that renders
// null on the server and on the client (no fetch, no flash). With a
// registration the pair is resolved once per module through next/dynamic,
// so it is server-rendered with the rest of the header (the lazy loader
// suspends until the module is in) and the buttons are in the first HTML.

import React from "react";
import dynamic from "next/dynamic";

import {
  HEADER_AUTH,
  loadHeaderAuth,
  type HeaderAuthProps,
} from "@/components/custom/landing/header-auth";

export type {
  HeaderAuthClasses,
  HeaderAuthProps,
} from "@/components/custom/landing/header-auth";

function NoHeaderAuth(_props: HeaderAuthProps) {
  return null;
}

export const HeaderAuthSlot: React.ComponentType<HeaderAuthProps> =
  HEADER_AUTH.length === 0
    ? NoHeaderAuth
    : dynamic<HeaderAuthProps>(() =>
        loadHeaderAuth().then((Pair) => ({ default: Pair ?? NoHeaderAuth })),
      );

export default HeaderAuthSlot;
