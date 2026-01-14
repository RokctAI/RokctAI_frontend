export interface Course {
    name: string;
    title: string;
    description: string;
    short_introduction?: string;
    image?: string;
    is_published: boolean;
    is_featured: boolean;
    level?: string;
    duration?: string;
    lesson_count?: number;
    instructors?: any[]; // Refine if needed
    chapters?: CourseChapter[];
    is_enrolled?: boolean;
}

export interface CourseChapter {
    name: string;
    title: string;
    lessons: CourseLesson[];
}

export interface CourseLesson {
    name: string;
    title: string;
    body?: string;
    content?: string; // JSON string for EditorJS
    video_url?: string;
    youtube?: string;
    is_complete?: boolean;
    prev?: string;
    next?: string;
    chapter_title?: string;
    course_title?: string;
}
