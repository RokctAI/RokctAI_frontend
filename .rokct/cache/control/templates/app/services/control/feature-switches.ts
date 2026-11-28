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

import { ControlBaseService } from "@/app/services/control/base";

// The hub's feature switches (Ray 2026-11-22): per plan, with a per-tenant
// override, sent to every tenant on its subscription check (resolved in
// agent/subscriptions/pulsar/cmds.py get_subscription_status). The cmds are
// the hub's, System Manager only: control:get_feature_switches,
// control:set_plan_feature, control:set_tenant_feature (agent#687).
// Caller: app/actions/handson/control/feature-switches/feature-switches.ts.

export const FEATURE_KEYS = ["plugin_building", "unsupported_service_plugins", "voice_calls", "hands_on"] as const;
export type FeatureKey = (typeof FEATURE_KEYS)[number];
export type OverrideValue = "" | "On" | "Off";

export interface PlanSwitches {
  name: string;
  plan_name: string;
  features: Record<FeatureKey, boolean>;
}

export interface TenantOverride {
  name: string;
  site_name: string | null;
  customer: string | null;
  plan: string | null;
  overrides: Partial<Record<FeatureKey, "On" | "Off">>;
}

export interface FeatureSwitches {
  features: FeatureKey[];
  plans: PlanSwitches[];
  overrides: TenantOverride[];
  tenants: { name: string; site_name: string | null; plan: string | null }[];
}

export class FeatureSwitchService extends ControlBaseService {
  static async getSwitches(): Promise<FeatureSwitches> {
    const response = await this.call("control:get_feature_switches", {});
    return response?.message ?? { features: [], plans: [], overrides: [], tenants: [] };
  }

  static async setPlan(plan: string, feature: FeatureKey, on: boolean) {
    return this.call("control:set_plan_feature", { plan, feature, on: on ? 1 : 0 });
  }

  static async setTenant(subscription: string, feature: FeatureKey, value: OverrideValue) {
    return this.call("control:set_tenant_feature", { subscription, feature, value });
  }
}
