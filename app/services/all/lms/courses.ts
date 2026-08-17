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
  Course,
  CourseLesson,
} from "@/app/actions/handson/all/lms/courses/types";

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
      console.error(
        `CourseService.getCourseDetails(${courseName}) error:`,
        error,
      );
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
  static async getLesson(
    courseName: string,
    chapter: string,
    lesson: string,
  ): Promise<CourseLesson | null> {
    try {
      return await this.call("lms.lms.utils.get_lesson", {
        course: courseName,
        chapter: chapter,
        lesson: lesson,
      });
    } catch (error) {
      console.error(
        `CourseService.getLesson(${courseName}, ${chapter}, ${lesson}) error:`,
        error,
      );
      return null;
    }
  }

  /**
   * Save lesson progress.
   */
  static async saveProgress(courseName: string, lessonName: string) {
    try {
      return await this.call(
        "lms.lms.doctype.course_lesson.course_lesson.save_progress",
        {
          course: courseName,
          lesson: lessonName,
        },
      );
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
