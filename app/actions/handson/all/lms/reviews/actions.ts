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

"use server";

import { ReviewService } from "@/app/services/all/lms/reviews";
import { revalidatePath } from "next/cache";
import { verifyLmsRole } from "@/app/lib/roles";
import { z } from "zod";

const CreateReviewSchema = z.object({
  courseName: z.string().min(1),
  rating: z.number().min(1).max(5),
  reviewText: z.string().min(1),
});

export async function fetchCourseReviews(courseName: string) {
  if (!(await verifyLmsRole())) return [];
  return await ReviewService.getReviews(courseName);
}

export async function checkReviewStatus(courseName: string, user: string) {
  if (!(await verifyLmsRole())) return false;
  return await ReviewService.hasReviewed(courseName, user);
}

export async function createReviewAction(
  courseName: string,
  rating: number,
  reviewText: string,
) {
  if (!(await verifyLmsRole()))
    return { success: false, error: "Unauthorized" };

  const valid = CreateReviewSchema.safeParse({
    courseName,
    rating,
    reviewText,
  });
  if (!valid.success) return { success: false, error: valid.error.message };

  try {
    await ReviewService.createReview(courseName, rating, reviewText);
    revalidatePath(`/handson/all/lms/courses/${courseName}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
