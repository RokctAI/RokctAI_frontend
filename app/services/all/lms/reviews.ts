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
import { CourseReview } from "@/app/actions/handson/all/lms/reviews/types";

export class ReviewService extends BaseService {
  /**
   * Get reviews for a course
   */
  static async getReviews(courseName: string): Promise<CourseReview[]> {
    try {
      return await this.call("lms.lms.utils.get_reviews", {
        course: courseName,
      });
    } catch (error) {
      console.error("ReviewService.getReviews error:", error);
      return [];
    }
  }

  /**
   * Check if user has already reviewed
   * Note: Uses frappe.client.get_count on 'LMS Course Review'
   */
  static async hasReviewed(courseName: string, user: string): Promise<boolean> {
    try {
      const count = await this.call("frappe.client.get_count", {
        doctype: "LMS Course Review",
        filters: {
          course: courseName,
          owner: user,
        },
      });
      return count > 0;
    } catch (error) {
      console.error("ReviewService.hasReviewed error:", error);
      return false;
    }
  }

  /**
   * Create a review
   */
  static async createReview(
    courseName: string,
    rating: number,
    reviewText: string,
  ) {
    try {
      return await this.call("frappe.desk.form.save.savedocs", {
        doc: {
          doctype: "LMS Course Review",
          course: courseName,
          rating: rating,
          review: reviewText || "",
        },
        action: "Save",
      });
    } catch (error) {
      console.error("ReviewService.createReview error:", error);
      throw error;
    }
  }
}
