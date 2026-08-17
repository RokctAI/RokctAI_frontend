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

export class RecruitmentService {
  // --- JOB OPENINGS ---
  static async getJobOpenings() {
    return BaseService.getList("Job Opening", {
      fields: [
        "name",
        "job_title",
        "status",
        "department",
        "designation",
        "vacancies",
        "creation",
      ],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async getJobOpening(name: string) {
    return BaseService.getDoc("Job Opening", name);
  }

  static async createJobOpening(data: any) {
    return BaseService.insert({ doctype: "Job Opening", ...data });
  }

  // --- JOB APPLICANTS ---
  static async getJobApplicants() {
    return BaseService.getList("Job Applicant", {
      fields: [
        "name",
        "applicant_name",
        "email_id",
        "job_title",
        "status",
        "creation",
      ],
      limit_page_length: 50,
      order_by: "creation desc",
    });
  }

  static async createJobApplicant(data: any) {
    return BaseService.insert({ doctype: "Job Applicant", ...data });
  }
}
