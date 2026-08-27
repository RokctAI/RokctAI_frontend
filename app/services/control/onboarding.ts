/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
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
