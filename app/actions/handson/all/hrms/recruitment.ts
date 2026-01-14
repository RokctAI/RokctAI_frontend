"use server";

import { RecruitmentService } from "@/app/services/all/hrms/recruitment";
import { revalidatePath } from "next/cache";

// --- JOB OPENINGS ---

export interface JobOpeningData {
    job_title: string;
    status: "Open" | "Closed";
    description?: string;
    department?: string;
    designation?: string;
    planned_start_date?: string;
    vacancies?: number;
}

export async function getJobOpenings() {
    try {
        const res = await RecruitmentService.getJobOpenings();
        return res.data;
    } catch (e) {
        console.error("Failed to fetch Job Openings", e);
        return [];
    }
}

export async function getJobOpening(name: string) {
    try {
        const res = await RecruitmentService.getJobOpening(name);
        return res.data;
    } catch (e) {
        console.error(`Failed to fetch Job Opening ${name}`, e);
        return null;
    }
}

export async function createJobOpening(data: JobOpeningData) {
    try {
        const response = await RecruitmentService.createJobOpening(data);
        revalidatePath("/handson/all/hr/recruitment");
        return { success: true, message: response };
    } catch (e: any) {
        console.error("Failed to create Job Opening", e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}

// --- JOB APPLICANTS (CANDIDATES) ---

export interface JobApplicantData {
    applicant_name: string;
    email_id: string;
    job_title: string; // The Job Opening
    status: "Open" | "Replied" | "Rejected" | "Hold" | "Accepted";
    cover_letter?: string;
    resume_attachment?: string;
}

export async function getJobApplicants() {
    try {
        const res = await RecruitmentService.getJobApplicants();
        return res.data;
    } catch (e) {
        console.error("Failed to fetch Job Applicants", e);
        return [];
    }
}

export async function createJobApplicant(data: JobApplicantData) {
    try {
        const response = await RecruitmentService.createJobApplicant(data);
        revalidatePath("/handson/all/hr/recruitment");
        return { success: true, message: response };
    } catch (e: any) {
        console.error("Failed to create Job Applicant", e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
