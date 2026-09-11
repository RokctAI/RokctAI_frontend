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

import { BaseService, ServiceOptions } from "@/app/services/common/base";

// Calls agent/agent/frappe's plan_builder module via its manifest.json
// whitelisted aliases ("{app_name}.api.plan_builder.<fn>" — the standard
// "{app_name}.api.<module>.<endpoint>" alias shape used by every other
// module manifest), named to the gateway as the prefix-free key
// ("api.plan_builder.<fn>"; an app-prefixed cmd is refused on a tenant
// site). The manifest and this file must stay in lockstep.
const NS = "api.plan_builder";

export interface RokChatReply {
  status: string;
  message: string;
  tool_calls?: unknown[] | null;
  session_id?: string | null;
  trace_id?: string;
}

export interface CommitPlanResult {
  status?: string;
  message?: string;
  [key: string]: unknown;
}

export class PlanBuilderService {
  /** Chat with the ROK agent (plan-builder conversational gateway). */
  static async chatWithRok(
    message: string,
    sessionId?: string,
    model?: string,
    options?: ServiceOptions,
  ): Promise<RokChatReply | null> {
    const response = await BaseService.call(
      `${NS}.chat_with_rok`,
      { message, session_id: sessionId, model },
      options,
    );
    return response?.message || null;
  }

  /**
   * Commit a strategic plan. Pass either `planData` (a JSON string payload)
   * or `profileType` + `instanceName` for compiled markdown deliverables.
   */
  static async commitPlan(
    params: {
      planData?: string;
      profileType?: string;
      instanceName?: string;
    },
    options?: ServiceOptions,
  ): Promise<CommitPlanResult | null> {
    const response = await BaseService.call(
      `${NS}.commit_plan`,
      {
        plan_data: params.planData,
        profile_type: params.profileType,
        instance_name: params.instanceName,
      },
      options,
    );
    return response?.message || null;
  }
}
