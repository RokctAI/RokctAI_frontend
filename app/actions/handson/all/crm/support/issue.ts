"use server";

import { revalidatePath } from "next/cache";
import { verifyCrmRole } from "@/app/lib/roles";
import { SupportService } from "@/app/services/all/crm/support";
import { IssueSchema, IssueData } from "./types";



export async function getIssues() {
    if (!await verifyCrmRole()) return [];
    try {
        const res = await SupportService.getIssues(1, 100);
        return res.data;
    } catch (e) {
        console.error("Failed to fetch Issues", e);
        return [];
    }
}

export async function getIssue(name: string) {
    if (!await verifyCrmRole()) return null;
    try {
        return await SupportService.getIssue(name);
    } catch (e) {
        console.error(`Failed to fetch Issue ${name}`, e);
        return null;
    }
}

export async function createIssue(data: IssueData) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };

    const validation = IssueSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.issues[0].message };
    }

    try {
        const result = await SupportService.createIssue(data);
        revalidatePath("/handson/all/crm/support/issue");
        return { success: true, message: result };
    } catch (e: any) {
        console.error("Failed to create Issue", e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}

export async function updateIssue(name: string, data: Partial<IssueData>) {
    if (!await verifyCrmRole()) return { success: false, error: "Unauthorized" };
    try {
        const result = await SupportService.updateIssue(name, data);
        revalidatePath("/handson/all/crm/support/issue");
        return { success: true, message: result };
    } catch (e: any) {
        console.error(`Failed to update Issue ${name}`, e);
        return { success: false, error: e?.message || "Unknown error" };
    }
}
