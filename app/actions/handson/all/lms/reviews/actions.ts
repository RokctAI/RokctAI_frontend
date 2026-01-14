"use server";

import { ReviewService } from "@/app/services/all/lms/reviews";
import { revalidatePath } from "next/cache";
import { verifyLmsRole } from "@/app/lib/roles";
import { z } from "zod";

const CreateReviewSchema = z.object({
    courseName: z.string().min(1),
    rating: z.number().min(1).max(5),
    reviewText: z.string().min(1)
});

export async function fetchCourseReviews(courseName: string) {
    if (!await verifyLmsRole()) return [];
    return await ReviewService.getReviews(courseName);
}

export async function checkReviewStatus(courseName: string, user: string) {
    if (!await verifyLmsRole()) return false;
    return await ReviewService.hasReviewed(courseName, user);
}

export async function createReviewAction(courseName: string, rating: number, reviewText: string) {
    if (!await verifyLmsRole()) return { success: false, error: "Unauthorized" };

    const valid = CreateReviewSchema.safeParse({ courseName, rating, reviewText });
    if (!valid.success) return { success: false, error: valid.error.message };

    try {
        await ReviewService.createReview(courseName, rating, reviewText);
        revalidatePath(`/handson/all/lms/courses/${courseName}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
