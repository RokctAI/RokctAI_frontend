import { BaseService } from "@/app/services/common/base";
import { Course, CourseLesson } from "@/app/actions/handson/all/lms/courses/types";

export class CourseService extends BaseService {
    /**
     * Get all available courses.
     */
    static async getAllCourses() {
        try {
            return await this.call("lms.lms.api.get_all_courses");
        } catch (error) {
            console.error("CourseService.getAllCourses error:", error);
            return [];
        }
    }

    /**
     * Get details for a specific course by name.
     */
    static async getCourseDetails(courseName: string): Promise<Course | null> {
        try {
            return await this.call("lms.lms.api.get_course_details", {
                course: courseName,
            });
        } catch (error) {
            console.error(`CourseService.getCourseDetails(${courseName}) error:`, error);
            return null;
        }
    }

    /**
     * Get user's enrolled courses.
     */
    static async getMyCourses() {
        try {
            return await this.call("lms.lms.api.get_my_courses");
        } catch (error) {
            console.error("CourseService.getMyCourses error:", error);
            return [];
        }
    }

    /**
     * Get lesson content and details.
     */
    static async getLesson(courseName: string, chapter: string, lesson: string): Promise<CourseLesson | null> {
        try {
            return await this.call("lms.lms.utils.get_lesson", {
                course: courseName,
                chapter: chapter,
                lesson: lesson
            });
        } catch (error) {
            console.error(`CourseService.getLesson(${courseName}, ${chapter}, ${lesson}) error:`, error);
            return null;
        }
    }

    /**
     * Save lesson progress.
     */
    static async saveProgress(courseName: string, lessonName: string) {
        try {
            return await this.call("lms.lms.doctype.course_lesson.course_lesson.save_progress", {
                course: courseName,
                lesson: lessonName
            });
        } catch (error) {
            console.error(`CourseService.saveProgress error:`, error);
            return null;
        }
    }

    /**
     * Admin: Get created courses.
     */
    static async getCreatedCourses() {
        try {
            return await this.call("lms.lms.api.get_created_courses");
        } catch (error) {
            console.error("CourseService.getCreatedCourses error:", error);
            return [];
        }
    }
}
