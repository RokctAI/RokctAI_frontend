export interface Assignment {
    name: string;
    title: string;
    description: string;
    due_date?: string;
    status: string;
    max_score?: number;
    course: string;
}

export interface Submission {
    name: string;
    status: string;
    answer?: string;
    assignment_attachment?: string;
    comments?: string;
    grade?: string;
    owner: string;
    creation: string;
}
