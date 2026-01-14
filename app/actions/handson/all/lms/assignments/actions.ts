"use server";

import { AssignmentService } from "@/app/services/all/lms/assignments";
import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/app/(auth)/actions";
import { verifyLmsRole } from "@/app/lib/roles";
import { z } from "zod";

const SubmitAssignmentSchema = z.object({
    assignmentName: z.string().min(1),
    answer: z.string().optional(),
    attachment: z.string().optional(),
    submissionName: z.string().optional()
}).refine(data => data.answer || data.attachment, {
    message: "Either answer or attachment must be provided"
});

export async function fetchAssignment(assignmentName: string) {
    if (!await verifyLmsRole()) return null;
    return await AssignmentService.getAssignment(assignmentName);
}

export async function fetchMySubmission(assignmentName: string) {
    if (!await verifyLmsRole()) return null;
    const session = await getCurrentSession();
    if (!session?.user?.email) return null;
    return await AssignmentService.getSubmission(assignmentName, session.user.email);
}

export async function submitAssignmentAction(assignmentName: string, data: { answer?: string, attachment?: string, submissionName?: string }) {
    if (!await verifyLmsRole()) return { success: false, error: "Unauthorized" }; // Strict Role Check

    const session = await getCurrentSession();
    if (!session?.user?.email) return { success: false, error: "No User Session" };

    const valid = SubmitAssignmentSchema.safeParse({ assignmentName, ...data });
    if (!valid.success) {
        return { success: false, error: valid.error.issues[0].message };
    }

    const doc: any = {
        doctype: "LMS Assignment Submission",
        assignment: assignmentName,
        member: session.user.email,
        answer: data.answer,
        assignment_attachment: data.attachment
    };

    if (data.submissionName) {
        doc.name = data.submissionName;
    }

    try {
        const result = await AssignmentService.submitAssignment(doc);
        revalidatePath("/handson/all/lms");
        return { success: true, message: result };
    } catch (e: any) {
        return { success: false, error: e?.message || "Submission failed" };
    }
}
