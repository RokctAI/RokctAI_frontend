import { BaseService } from "@/app/services/common/base";

export class ManufacturingService {
    // --- BOM ---
    static async getBOMs() {
        return BaseService.getList("BOM", {
            fields: ["name", "item", "is_active", "docstatus"],
            limit_page_length: 50,
            order_by: "creation desc"
        });
    }

    static async getBOM(name: string) {
        return BaseService.get("BOM", name);
    }

    static async createBOM(item: string, quantity: number, items: any[]) {
        return BaseService.insert({ doctype: "BOM", item, quantity, items });
    }

    // --- WORK ORDER ---
    static async getWorkOrders() {
        return BaseService.getList("Work Order", {
            fields: ["name", "production_item", "qty", "status", "planned_start_date"],
            limit_page_length: 50,
            order_by: "creation desc"
        });
    }

    static async createWorkOrder(data: any) {
        return BaseService.insert({ doctype: "Work Order", ...data });
    }

    // --- PRODUCTION PLAN ---
    static async getProductionPlans() {
        return BaseService.getList("Production Plan", {
            fields: ["name", "status", "posting_date", "company"],
            limit_page_length: 50,
            order_by: "creation desc"
        });
    }

    static async createProductionPlan(data: any) {
        return BaseService.insert({ doctype: "Production Plan", ...data });
    }

    // --- SHOP FLOOR ---
    static async getShopFloorItems(doctype: string) {
        let fields = ["name"];
        if (doctype === "Workstation") fields = ["name", "workstation_name", "production_capacity"];
        if (doctype === "Operation") fields = ["name", "description"];
        if (doctype === "Job Card") fields = ["name", "work_order", "operation", "workstation", "status"];
        if (doctype === "Downtime Entry") fields = ["name", "workstation", "stop_reason", "from_time", "to_time"];

        return BaseService.getList(doctype, {
            fields,
            limit_page_length: 50,
            order_by: "creation desc"
        });
    }

    static async createShopFloorItem(data: any) {
        return BaseService.insert(data);
    }

    // --- ROUTING ---
    static async getRoutings() {
        return BaseService.getList("Routing", {
            fields: ["name", "routing_name", "status"],
            limit_page_length: 50,
            order_by: "creation desc"
        });
    }

    static async createRouting(data: any) {
        return BaseService.insert({ doctype: "Routing", ...data });
    }
}
