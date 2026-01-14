import { BaseService } from "@/app/services/common/base";
import { LiveClass, Evaluation } from "@/app/actions/handson/all/lms/events/types";

export class EventService extends BaseService {
    /**
     * Get user's upcoming live classes.
     */
    static async getMyLiveClasses(): Promise<LiveClass[]> {
        try {
            return await this.call("lms.lms.api.get_my_live_classes");
        } catch (error) {
            console.error("EventService.getMyLiveClasses error:", error);
            return [];
        }
    }

    /**
     * Get upcoming evaluations.
     */
    static async getUpcomingEvaluations(courses?: string[], batch?: string): Promise<Evaluation[]> {
        try {
            return await this.call("lms.lms.utils.get_upcoming_evals", { courses, batch });
        } catch (error) {
            console.error("EventService.getUpcomingEvaluations error:", error);
            return [];
        }
    }

    /**
     * Admin: Get all live classes.
     */
    static async getAdminLiveClasses() {
        try {
            return await this.call("lms.lms.api.get_admin_live_classes");
        } catch (error) {
            console.error("EventService.getAdminLiveClasses error:", error);
            return [];
        }
    }

    /**
     * Admin: Get all evaluations.
     */
    static async getAdminEvals() {
        try {
            return await this.call("lms.lms.api.get_admin_evals");
        } catch (error) {
            console.error("EventService.getAdminEvals error:", error);
            return [];
        }
    }
}
