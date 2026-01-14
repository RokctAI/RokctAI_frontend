export interface Batch {
    name: string;
    title: string;
    course: string;
    start_date: string;
    end_date: string;
    students: any[]; // Or list of student names/emails
    instructors: any[];
}
