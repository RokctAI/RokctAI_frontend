export interface LiveClass {
    name: string;
    title: string;
    start_time: string;
    end_time: string;
    meeting_link: string;
    status: string;
    course: string;
}

export interface Evaluation {
    name: string;
    title: string;
    due_date: string;
    type: 'Quiz' | 'Assignment';
    course: string;
    status?: string;
}
