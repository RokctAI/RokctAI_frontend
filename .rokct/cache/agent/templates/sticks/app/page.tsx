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

// The page that serves `/` in a shell whose home SDK is agent_sdk with
// app_type sticks (agent_sdk 1.25.0): the Sticks landing Ray approved
// (components/custom/landing/sticks-landing.tsx). Sticks is app-only, so
// the page explains it and links the app's downloads; it reads no session
// and no backend. The release and the tour screens are re-read from GitHub
// at most once an hour (`revalidate`), so a new release or a new tour
// capture reaches the page without a redeploy.

import type { Metadata } from "next";

import { sticksFontClassName } from "@/components/custom/landing/sticks-fonts";
import { SticksLanding } from "@/components/custom/landing/sticks-landing";
import { STICKS_META } from "@/components/custom/landing/sticks-landing-config";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: STICKS_META.title },
  description: STICKS_META.description,
};

export default function Page() {
  return <SticksLanding fontClassName={sticksFontClassName} />;
}
