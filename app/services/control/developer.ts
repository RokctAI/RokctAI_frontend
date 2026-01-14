import { ControlBaseService } from "./base";
import { getControlClient } from "@/app/lib/client";

export class DeveloperService {
    static async getSwaggerSettings() {
        return ControlBaseService.getList("Swagger Settings", {
            fields: ["name", "installed_apps_cache"],
            limit: 1
        });
    }

    static async generateSwaggerDocumentation() {
        return ControlBaseService.call("rokct.control.doctype.swagger_settings.swagger_settings.enqueue_swagger_generation");
    }

    static async getSwaggerAppRenames() {
        return ControlBaseService.getList("Swagger App Rename", {
            fields: ["name", "original_name", "new_name"],
            order_by: "creation desc"
        });
    }

    static async deleteSwaggerAppRename(name: string) {
        return ControlBaseService.delete("Swagger App Rename", name);
    }

    static async getExcludedDoctypes() {
        return ControlBaseService.getList("Excluded DocType", {
            fields: ["name", "doctype_name"],
            order_by: "creation desc"
        });
    }

    static async deleteExcludedDoctype(name: string) {
        return ControlBaseService.delete("Excluded DocType", name);
    }

    static async getExcludedSwaggerModules() {
        return ControlBaseService.getList("Excluded Swagger Module", {
            fields: ["name", "module_name"],
            order_by: "creation desc"
        });
    }

    static async deleteExcludedSwaggerModule(name: string) {
        return ControlBaseService.delete("Excluded Swagger Module", name);
    }

    static async getExcludedSwaggerDoctypes() {
        return ControlBaseService.getList("Excluded Swagger DocType", {
            fields: ["name", "doctype_name"],
            order_by: "creation desc"
        });
    }

    static async deleteExcludedSwaggerDoctype(name: string) {
        return ControlBaseService.delete("Excluded Swagger DocType", name);
    }

    static async getTenantErrorLogs() {
        return ControlBaseService.getList("Tenant Error Log", {
            fields: ["name", "error", "timestamp", "tenant"],
            order_by: "timestamp desc",
            limit: 50
        });
    }

    static async getRawNeurotrophinCache() {
        return ControlBaseService.getList("Raw Neurotrophin Cache", {
            fields: ["name", "key", "expires_at"],
            limit: 50
        });
    }

    static async getRawTenderCache() {
        return ControlBaseService.getList("Raw Tender Cache", {
            fields: ["name", "key", "expires_at"],
            limit: 50
        });
    }
}
