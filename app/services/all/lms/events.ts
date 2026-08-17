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

import { BaseService } from "@/app/services/common/base";
import {
  LiveClass,
  Evaluation,
} from "@/app/actions/handson/all/lms/events/types";

export class EventService extends BaseService {
  /**
   * Get user's upcoming live classes.
   */
  static async getMyLiveClasses(): Promise<LiveClass[]> {
    try {
      return await this.call("lms.lms.api.get_my_live_classes");
    } catch (error) {
      console.error("EventService.getMyLiveClasses error:", error);
      return [];
    }
  }

  /**
   * Get upcoming evaluations.
   */
  static async getUpcomingEvaluations(
    courses?: string[],
    batch?: string,
  ): Promise<Evaluation[]> {
    try {
      return await this.call("lms.lms.utils.get_upcoming_evals", {
        courses,
        batch,
      });
    } catch (error) {
      console.error("EventService.getUpcomingEvaluations error:", error);
      return [];
    }
  }

  /**
   * Admin: Get all live classes.
   */
  static async getAdminLiveClasses() {
    try {
      return await this.call("lms.lms.api.get_admin_live_classes");
    } catch (error) {
      console.error("EventService.getAdminLiveClasses error:", error);
      return [];
    }
  }

  /**
   * Admin: Get all evaluations.
   */
  static async getAdminEvals() {
    try {
      return await this.call("lms.lms.api.get_admin_evals");
    } catch (error) {
      console.error("EventService.getAdminEvals error:", error);
      return [];
    }
  }
}
