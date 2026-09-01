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
   */
  static async chatWithRok(
    message: string,
    sessionId?: string,
    model?: string,
  ) {
    return ControlBaseService.call("control.api.chat_with_rok", {
      message,
      session_id: sessionId,
      model,
    });
  }
}
