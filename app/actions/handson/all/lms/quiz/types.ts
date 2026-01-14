export interface Quiz {
    name: string;
    title: string;
    passing_score: number;
    max_attempts: number;
    description?: string;
    question_list?: any[]; // Keep raw for now or refine
}

export interface QuestionDetails {
    name: string;
    question: string;
    type: string;
    options: any[];
}

export interface QuizSubmission {
    name: string;
    creation: string;
    score: number;
    score_out_of: number;
    percentage: number;
    passing_percentage: number;
}

export interface QuizResult {
    score: number;
    max_score: number;
    percentage: number;
    passed: boolean;
}
