import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class DecisionService {
    static async runEngine(applicationId: string, options?: ServiceOptions) {
        const response = await BaseService.call("core.rlending.api.decision.get_credit_score", {
            loan_application: applicationId
        }, options);
        return response?.message;
    }
}
