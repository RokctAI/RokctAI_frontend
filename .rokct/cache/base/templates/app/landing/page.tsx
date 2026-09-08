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

// The generic landing host's page: reads the session through the kernel's
// seam (never through app/(auth) directly), prefetches the platform's plans
// and hands both to the client orchestrator. base_sdk carries the host and
// the hero (copy in components/custom/landing/hero-config.ts); every
// content section comes from the home SDK that registers it in
// components/custom/landing/page-sections.ts (the hero's form from
// components/custom/landing/hero-form.ts, and what answers its input from
// components/custom/landing/hero-sections.ts), so with nothing registered
// the page is the hero alone. It also imports the platform scrollbar
// (app/styles/rokct-scroll.css, rokctai_frontend's yellow scroll thumb),
// so a composed shell has it on /landing with no host edit.

import "@/app/styles/rokct-scroll.css";

import { getLandingPlans, type LandingPlan } from "@/app/actions/base/landing";
import { getPlatformSession } from "@/app/services/base/session";
import { LandingContent } from "@/components/custom/landing-content";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const session = await getPlatformSession();
  let plans: LandingPlan[] = [];
  try {
    plans = await getLandingPlans();
  } catch (e) {
    console.error("[landing] prefetch error:", e);
  }
  return <LandingContent plans={plans} session={session} />;
}
