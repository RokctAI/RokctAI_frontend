/*
 * Copyright (c) 2026 RokctAI
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
