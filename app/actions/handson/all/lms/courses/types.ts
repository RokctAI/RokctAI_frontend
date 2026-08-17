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
