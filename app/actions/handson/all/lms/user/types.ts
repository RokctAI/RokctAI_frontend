export interface UserProfile {
    name: string;
    email: string;
    username: string;
    full_name: string;
    bio?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    user_image?: string;
    interest?: string;
    occupation?: string;
}

export interface LMSCertificate {
    name: string;
    course: string;
    course_title: string;
    issue_date: string;
    certificate_url?: string;
}

export interface UserStreak {
    current_streak: number;
    longest_streak: number;
}
