import { BaseService } from "@/app/services/common/base";
import { DiscussionTopic } from "@/app/actions/handson/all/lms/discussions/types";

export class DiscussionService extends BaseService {
    /**
     * Get discussion topics for a document (lesson, course, etc.)
     */
    static async getTopics(doctype: string, docname: string, singleThread = false): Promise<DiscussionTopic[]> {
        try {
            return await this.call("lms.lms.utils.get_discussion_topics", {
                doctype,
                docname,
                single_thread: singleThread
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
                    title: title
                },
                action: "Save"
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
                topic: topic
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
                    reply: reply
                },
                action: "Save"
            });
        } catch (error) {
            console.error("DiscussionService.createReply error:", error);
            throw error;
        }
    }
}
