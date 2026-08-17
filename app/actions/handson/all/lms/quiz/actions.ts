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

import { QuizService } from "@/app/services/all/lms/quiz";
import { verifyLmsRole } from "@/app/lib/roles";
import { z } from "zod";

const CheckAnswerSchema = z.object({
  questionName: z.string().min(1),
  type: z.string(),
  answers: z.array(z.any()), // Allow mixed types for now but enforce array
});

export async function fetchQuiz(quizName: string) {
  if (!(await verifyLmsRole())) return null;
  return await QuizService.getQuiz(quizName);
}

export async function fetchQuestionDetails(questionName: string) {
  if (!(await verifyLmsRole())) return null;
  return await QuizService.getQuestionDetails(questionName);
}

export async function checkAnswer(
  questionName: string,
  type: string,
  answers: any[],
) {
  if (!(await verifyLmsRole())) return { is_correct: false };

  const valid = CheckAnswerSchema.safeParse({ questionName, type, answers });
  if (!valid.success) return { is_correct: false, error: "Invalid Input" };

  return await QuizService.checkAnswer(questionName, type, answers);
}

export async function fetchQuizSummary(quizName: string) {
  if (!(await verifyLmsRole())) return null;
  return await QuizService.getQuizSummary(quizName);
}

export async function fetchQuizAttempts(quizName: string) {
  if (!(await verifyLmsRole())) return [];
  return await QuizService.getAttempts(quizName);
}
