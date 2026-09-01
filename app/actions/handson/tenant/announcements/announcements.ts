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

"use server";

import { AnnouncementService } from "@/app/services/tenant/announcements";
import { SubscriptionService } from "@/app/services/tenant/subscriptions";

export async function getMyAnnouncements() {
  try {
    // 1. Fetch all global broadcasts
    const allAnnouncements = await AnnouncementService.getGlobalAnnouncements();

    // 2. Fetch my subscription plan
    // If sub module not fully ready, fallback to "Simple"
    let myPlan = "Simple";
    try {
      const status = await SubscriptionService.getSubscriptionStatus();
      if (status && status.plan_name) {
        myPlan = status.plan_name;
        // Map complex plan names to simple categories if needed
        if (myPlan.includes("Pro")) myPlan = "Pro";
        if (myPlan.includes("Enterprise")) myPlan = "Enterprise";
      }
    } catch (e) {
      // ignore
    }

    // 3. Filter
    const relevant = allAnnouncements.filter((ann) => {
      if (!ann.is_active) return false;
      if (ann.target_plans.includes("All")) return true;
      return ann.target_plans.some((p) => myPlan.includes(p));
    });

    return relevant;
  } catch (e) {
    console.error("Failed to fetch tenant announcements", e);
    return [];
  }
}
