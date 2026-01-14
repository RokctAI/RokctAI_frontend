import { BaseService } from "@/app/services/common/base";
import { JobOpening } from "@/app/actions/handson/all/lms/jobs/types";

export class JobService extends BaseService {

    /**
     * Get list of Job Opportunities (Native LMS)
     */
    static async getJobs(): Promise<JobOpening[]> {
        return await this.getList("Job Opportunity", {
            fields: ["name", "job_title", "company", "location", "status", "type", "description"],
            filters: {
                status: "Open"
            },
            order_by: "creation desc"
        });
    }

    /**
     * Get Job Details
     */
    static async getJob(jobName: string): Promise<JobOpening | null> {
        return await this.getDoc("Job Opportunity", jobName);
    }
}
