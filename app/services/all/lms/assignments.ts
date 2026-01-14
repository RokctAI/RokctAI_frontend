import { BaseService } from "@/app/services/common/base";
import { Assignment, Submission } from "@/app/actions/handson/all/lms/assignments/types";

export class AssignmentService extends BaseService {

    /**
     * Get Assignment Definition
     */
    static async getAssignment(assignmentName: string): Promise<Assignment | null> {
        return await this.getDoc("LMS Assignment", assignmentName);
    }

    /**
     * Get Existing Submission
     */
    static async getSubmission(assignmentName: string, member: string): Promise<Submission | null> {
        const list = await this.getList("LMS Assignment Submission", {
            filters: {
                assignment: assignmentName,
                member: member
            },
            fields: ["name", "status", "answer", "assignment_attachment", "comments", "grade", "owner", "creation"],
            limit_page_length: 1
        });
        return list[0] || null;
    }

    /**
     * Create or Update Submission
     */
    static async submitAssignment(doc: any) {
        // If name exists, update; else insert
        if (doc.name) {
            return await this.call("frappe.client.save", { doc });
        } else {
            return await this.call("frappe.client.insert", { doc });
        }
    }
}
