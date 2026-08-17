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
  UserProfile,
  LMSCertificate,
} from "@/app/actions/handson/all/lms/user/types";

export class UserService extends BaseService {
  /**
   * Get details of the currently logged-in user.
   */
  static async getUserInfo(): Promise<UserProfile | null> {
    try {
      return await this.call("lms.lms.api.get_user_info");
    } catch (error) {
      console.error("UserService.getUserInfo error:", error);
      return null;
    }
  }

  /**
   * Get user streak info.
   */
  static async getStreakInfo() {
    try {
      return await this.call("lms.lms.api.get_streak_info");
    } catch (error) {
      console.error("UserService.getStreakInfo error:", error);
      return null;
    }
  }

  /**
   * Get user profile details
   */
  static async getProfile() {
    return await this.call("frappe.client.get", {
      doctype: "User",
      name: "me", // 'me' maps to current user in Frappe
    });
  }

  /**
   * Update user profile
   */
  static async updateProfile(data: any) {
    return await this.call("frappe.client.save", {
      doc: {
        doctype: "User",
        name: "me",
        ...data,
      },
    });
  }

  /**
   * Get user certificates
   */
  static async getCertificates(): Promise<LMSCertificate[]> {
    return await this.getList("LMS Certificate", {
      filters: {
        member: "me",
      },
      fields: [
        "name",
        "course",
        "course_title",
        "creation",
        "certificate_link",
      ],
      order_by: "creation desc",
    });
  }
}
