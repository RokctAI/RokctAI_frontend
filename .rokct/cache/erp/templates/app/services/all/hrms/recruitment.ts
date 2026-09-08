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
