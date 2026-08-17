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

import { BaseService } from "@/app/services/common/base";
import {
  Quiz,
  QuestionDetails,
  QuizSubmission,
  QuizResult,
} from "@/app/actions/handson/all/lms/quiz/types";

export class QuizService extends BaseService {
  /**
   * Get Quiz Definition (Settings, Question List)
   */
  static async getQuiz(quizName: string): Promise<Quiz | null> {
    return await this.getDoc("LMS Quiz", quizName);
  }

  /**
   * Get Details for a specific question (Content, Options)
   */
  static async getQuestionDetails(
    questionName: string,
  ): Promise<QuestionDetails> {
    return await this.call("lms.lms.utils.get_question_details", {
      question: questionName,
    });
  }

  /**
   * Check Answer (Immediate validation)
   */
  static async checkAnswer(questionName: string, type: string, answers: any[]) {
    return await this.call("lms.lms.doctype.lms_quiz.lms_quiz.check_answer", {
      question: questionName,
      type: type,
      answers: JSON.stringify(answers),
    });
  }

  /**
   * Get Quiz Summary (Final Result)
   */
  static async getQuizSummary(quizName: string): Promise<QuizResult | null> {
    return await this.call("lms.lms.doctype.lms_quiz.lms_quiz.quiz_summary", {
      quiz: quizName,
    });
  }

  /**
   * Fetch User's Attempts
   */
  static async getAttempts(quizName: string): Promise<QuizSubmission[]> {
    return await this.getList("LMS Quiz Submission", {
      filters: {
        quiz: quizName,
      },
      fields: [
        "name",
        "creation",
        "score",
        "score_out_of",
        "percentage",
        "passing_percentage",
      ],
      order_by: "creation desc",
    });
  }
}
