import { BaseService } from "@/app/services/common/base";

export class RecruitmentService {
    // --- JOB OPENINGS ---
    static async getJobOpenings() {
        return BaseService.getList("Job Opening", {
            fields: ["name", "job_title", "status", "department", "designation", "vacancies", "creation"],
            limit_page_length: 50,
            order_by: "creation desc"
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
            fields: ["name", "applicant_name", "email_id", "job_title", "status", "creation"],
            limit_page_length: 50,
            order_by: "creation desc"
        });
    }

    static async createJobApplicant(data: any) {
        return BaseService.insert({ doctype: "Job Applicant", ...data });
    }
}
