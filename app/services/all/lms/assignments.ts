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
  Assignment,
  Submission,
} from "@/app/actions/handson/all/lms/assignments/types";

export class AssignmentService extends BaseService {
  /**
   * Get Assignment Definition
   */
  static async getAssignment(
    assignmentName: string,
  ): Promise<Assignment | null> {
    return await this.getDoc("LMS Assignment", assignmentName);
  }

  /**
   * Get Existing Submission
   */
  static async getSubmission(
    assignmentName: string,
    member: string,
  ): Promise<Submission | null> {
    const list = await this.getList("LMS Assignment Submission", {
      filters: {
        assignment: assignmentName,
        member: member,
      },
      fields: [
        "name",
        "status",
        "answer",
        "assignment_attachment",
        "comments",
        "grade",
        "owner",
        "creation",
      ],
      limit_page_length: 1,
    });
    return list[0] || null;
  }

  /**
   * Create or Update Submission
   */
  static async submitAssignment(doc: any) {
    // If name exists, update; else insert
    if (doc.name) {
      return await this.call("frappe.client.save", { doc });
    } else {
      return await this.call("frappe.client.insert", { doc });
    }
  }
}
