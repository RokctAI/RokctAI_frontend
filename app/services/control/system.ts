import { ControlBaseService } from "./base";

export class SystemService {
    static async getBrainSettings() {
        return ControlBaseService.getList("Brain Settings", {
            fields: ["name", "default_model", "max_tokens", "temperature"],
            limit: 1
        });
    }

    static async updateBrainSettings(name: string, data: any) {
        return ControlBaseService.update("Brain Settings", name, data);
    }

    static async getWeatherSettings() {
        return ControlBaseService.getList("Weather Settings", {
            fields: ["name", "api_key", "default_city"],
            limit: 1
        });
    }

    static async updateWeatherSettings(name: string, data: any) {
        return ControlBaseService.update("Weather Settings", name, data);
    }

    static async getUpdateAuthorizations() {
        return ControlBaseService.getList("Update Authorization", {
            fields: ["name", "app_name", "status", "requested_by", "creation", "new_branch_name"],
            order_by: "creation desc"
        });
    }

    static async approveUpdate(name: string) {
        return ControlBaseService.update("Update Authorization", name, { status: "Authorized" });
    }

    static async rejectUpdate(name: string) {
        return ControlBaseService.update("Update Authorization", name, { status: "Rejected" });
    }

    static async deleteUpdateAuthorization(name: string) {
        return ControlBaseService.delete("Update Authorization", name);
    }
}
