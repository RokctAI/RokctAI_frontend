"use server";

import { JobService } from "@/app/services/all/lms/jobs";
import { verifyLmsRole } from "@/app/lib/roles";

export async function fetchJobs() {
    if (!await verifyLmsRole()) return [];
    return await JobService.getJobs();
}

export async function fetchJob(jobName: string) {
    if (!await verifyLmsRole()) return null;
    return await JobService.getJob(jobName);
}
