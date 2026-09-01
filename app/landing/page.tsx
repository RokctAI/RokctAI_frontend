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

import { getSubscriptionPlans } from "@/lib/actions/getSubscriptionPlans";
import { LandingContent } from "@/components/custom/landing-content";
import { auth } from "@/app/(auth)/auth";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const session = await auth();
  let plans: any[] = [];

  try {
    const response = await getSubscriptionPlans();
    if (response.success && response.data) {
      plans = response.data;
    }
  } catch (e) {
    console.error("Prefetch error:", e);
  }

  return (
    <>
      <LandingContent plans={plans} session={session} />
    </>
  );
}
