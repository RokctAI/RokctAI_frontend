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

import { ControlBaseService } from "./base";

export class OnboardingService {
  /**
   * Fetches the onboarding questions template for a profile type (business/life)
   * from the Control site.
   */
  static async getOnboardingTemplate(profileType: "business" | "life") {
    return ControlBaseService.call("control.api.get_onboarding_template", {
      profile_type: profileType,
    });
  }

  /**
   * Sends a message to the secure ROK chat bridge on the Control VPS.
   *
   * The control gateway only accepts `control:`-prefixed cmds, and the ROK
   * proxy is registered there as `control:chat_with_rok` (control
   * hooks.py); the dotted `control.api.chat_with_rok` was never a gateway
   * key. `ControlBaseService.call` returns the RAW Frappe body, so the
   * `{status, message, tool_calls, ...}` result sits inside one top-level
   * `message` envelope. Unwrap it here so this returns the same shape as the
   * tenant `OnboardingService.chatWithRok` (where `platformCall` unwraps),
   * i.e. `res.message` is the reply text, not the whole result object.
   */
  static async chatWithRok(
    message: string,
    sessionId?: string,
    model?: string,
  ) {
    const body = await ControlBaseService.call("control:chat_with_rok", {
      message,
      session_id: sessionId,
      model,
    });
    return body && typeof body === "object" && "message" in body
      ? body.message
      : body;
  }
}
