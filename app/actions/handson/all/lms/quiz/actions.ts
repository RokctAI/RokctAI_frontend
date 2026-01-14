"use server";

import { QuizService } from "@/app/services/all/lms/quiz";
import { verifyLmsRole } from "@/app/lib/roles";
import { z } from "zod";

const CheckAnswerSchema = z.object({
    questionName: z.string().min(1),
    type: z.string(),
    answers: z.array(z.any()) // Allow mixed types for now but enforce array
});

export async function fetchQuiz(quizName: string) {
    if (!await verifyLmsRole()) return null;
    return await QuizService.getQuiz(quizName);
}

export async function fetchQuestionDetails(questionName: string) {
    if (!await verifyLmsRole()) return null;
    return await QuizService.getQuestionDetails(questionName);
}

export async function checkAnswer(questionName: string, type: string, answers: any[]) {
    if (!await verifyLmsRole()) return { is_correct: false };

    const valid = CheckAnswerSchema.safeParse({ questionName, type, answers });
    if (!valid.success) return { is_correct: false, error: "Invalid Input" };

    return await QuizService.checkAnswer(questionName, type, answers);
}

export async function fetchQuizSummary(quizName: string) {
    if (!await verifyLmsRole()) return null;
    return await QuizService.getQuizSummary(quizName);
}

export async function fetchQuizAttempts(quizName: string) {
    if (!await verifyLmsRole()) return [];
    return await QuizService.getAttempts(quizName);
}
