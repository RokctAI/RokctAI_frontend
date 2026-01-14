import { TenantBaseService } from "./base";

export class SystemService {
    static async getApiErrorLogs() {
        return TenantBaseService.getList("API Error Log", {
            fields: ["name", "title", "creation", "seen"],
            order_by: "creation desc",
            limit: 50
        });
    }

    static async getApiErrorLog(name: string) {
        return TenantBaseService.getDoc("API Error Log", name);
    }

    static async deleteApiErrorLog(name: string) {
        return TenantBaseService.delete("API Error Log", name);
    }

    static async getTokenUsageLogs() {
        return TenantBaseService.getList("Token Usage Tracker", {
            fields: ["name", "user", "model", "total_tokens", "creation"],
            order_by: "creation desc",
            limit: 50
        });
    }
}
