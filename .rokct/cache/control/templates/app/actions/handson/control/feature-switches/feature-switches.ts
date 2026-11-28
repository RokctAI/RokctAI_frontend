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

import { auth } from "@/app/(auth)/auth";
import { SYSTEM_ROLES } from "@/app/lib/role_constants";
import {
  FeatureSwitchService,
  type FeatureKey,
  type FeatureSwitches,
  type OverrideValue,
} from "@/app/services/control/feature-switches";

// Server actions for the hub's feature switches screen
// (app/handson/control/feature-switches/page.tsx). Staff only here; the hub
// enforces System Manager on every cmd as well.

const EMPTY: FeatureSwitches = { features: [], plans: [], overrides: [], tenants: [] };

async function isStaff() {
  const session = await auth();
  const roles: string[] = (session?.user as any)?.roles || [];
  return roles.some((r) => SYSTEM_ROLES.includes(r));
}

export async function getFeatureSwitches(): Promise<{ data: FeatureSwitches; error?: string }> {
  if (!(await isStaff())) return { data: EMPTY, error: "The feature switches are for platform staff only." };
  try {
    return { data: await FeatureSwitchService.getSwitches() };
  } catch (e) {
    console.error("control:get_feature_switches failed", e);
    return { data: EMPTY, error: "Could not load the switches." };
  }
}

export async function setPlanFeature(plan: string, feature: FeatureKey, on: boolean) {
  if (!(await isStaff())) return { success: false, error: "Not allowed." };
  try {
    await FeatureSwitchService.setPlan(plan, feature, on);
    return { success: true };
  } catch (e) {
    console.error("control:set_plan_feature failed", e);
    return { success: false, error: "Could not save that switch." };
  }
}

export async function setTenantFeature(subscription: string, feature: FeatureKey, value: OverrideValue) {
  if (!(await isStaff())) return { success: false, error: "Not allowed." };
  try {
    await FeatureSwitchService.setTenant(subscription, feature, value);
    return { success: true };
  } catch (e) {
    console.error("control:set_tenant_feature failed", e);
    return { success: false, error: "Could not save that override." };
  }
}
