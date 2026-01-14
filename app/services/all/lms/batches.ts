import { BaseService } from "@/app/services/common/base";
import { Batch } from "@/app/actions/handson/all/lms/batches/types";

export class BatchService extends BaseService {
    /**
     * Get user's batches.
     */
    static async getMyBatches(): Promise<Batch[]> {
        try {
            return await this.call("lms.lms.api.get_my_batches");
        } catch (error) {
            console.error("BatchService.getMyBatches error:", error);
            return [];
        }
    }

    /**
     * Admin: Get created batches.
     */
    static async getCreatedBatches() {
        try {
            return await this.call("lms.lms.api.get_created_batches");
        } catch (error) {
            console.error("BatchService.getCreatedBatches error:", error);
            return [];
        }
    }
}
