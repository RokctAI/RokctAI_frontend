import { BaseService } from "@/app/services/common/base";
import { CourseReview } from "@/app/actions/handson/all/lms/reviews/types";

export class ReviewService extends BaseService {
    /**
     * Get reviews for a course
     */
    static async getReviews(courseName: string): Promise<CourseReview[]> {
        try {
            return await this.call("lms.lms.utils.get_reviews", {
                course: courseName,
            });
        } catch (error) {
            console.error("ReviewService.getReviews error:", error);
            return [];
        }
    }

    /**
     * Check if user has already reviewed
     * Note: Uses frappe.client.get_count on 'LMS Course Review'
     */
    static async hasReviewed(courseName: string, user: string): Promise<boolean> {
        try {
            const count = await this.call("frappe.client.get_count", {
                doctype: "LMS Course Review",
                filters: {
                    course: courseName,
                    owner: user
                }
            });
            return count > 0;
        } catch (error) {
            console.error("ReviewService.hasReviewed error:", error);
            return false;
        }
    }

    /**
     * Create a review
     */
    static async createReview(courseName: string, rating: number, reviewText: string) {
        try {
            return await this.call("frappe.desk.form.save.savedocs", {
                doc: {
                    doctype: "LMS Course Review",
                    course: courseName,
                    rating: rating,
                    review: reviewText || ""
                },
                action: "Save"
            });
        } catch (error) {
            console.error("ReviewService.createReview error:", error);
            throw error;
        }
    }
}
