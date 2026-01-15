import { getClient } from "@/app/lib/client";

export class SubscriptionService {
    static async getSubscriptionStatus() {
        const client = await getClient();
        try {
            const response = await (client as any).call({
                method: "core.tenant.api.get_subscription_details",
                args: {}
            });
            return response?.message || { plan_name: "Simple", status: "Active" };
        } catch (e) {
            return { plan_name: "Simple", status: "Active" };
        }
    }
}
