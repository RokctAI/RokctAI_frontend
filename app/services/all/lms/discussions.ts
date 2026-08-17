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
import { DiscussionTopic } from "@/app/actions/handson/all/lms/discussions/types";

export class DiscussionService extends BaseService {
  /**
   * Get discussion topics for a document (lesson, course, etc.)
   */
  static async getTopics(
    doctype: string,
    docname: string,
    singleThread = false,
  ): Promise<DiscussionTopic[]> {
    try {
      return await this.call("lms.lms.utils.get_discussion_topics", {
        doctype,
        docname,
        single_thread: singleThread,
      });
    } catch (error) {
      console.error("DiscussionService.getTopics error:", error);
      return [];
    }
  }

  /**
   * Create a new discussion topic
   */
  static async createTopic(doctype: string, docname: string, title: string) {
    try {
      return await this.call("frappe.desk.form.save.savedocs", {
        doc: {
          doctype: "Discussion Topic",
          reference_doctype: doctype,
          reference_docname: docname,
          title: title,
        },
        action: "Save",
      });
    } catch (error) {
      console.error("DiscussionService.createTopic error:", error);
      throw error;
    }
  }
  /**
   * Get replies for a topic
   */
  static async getReplies(topic: string): Promise<DiscussionReply[]> {
    try {
      return await this.call("lms.lms.utils.get_discussion_replies", {
        topic: topic,
      });
    } catch (error) {
      console.error("DiscussionService.getReplies error:", error);
      return [];
    }
  }

  /**
   * Create a reply
   */
  static async createReply(topic: string, reply: string) {
    try {
      return await this.call("frappe.desk.form.save.savedocs", {
        doc: {
          doctype: "Discussion Reply",
          topic: topic,
          reply: reply,
        },
        action: "Save",
      });
    } catch (error) {
      console.error("DiscussionService.createReply error:", error);
      throw error;
    }
  }
}
