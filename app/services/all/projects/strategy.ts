import { BaseService } from "@/app/services/common/base";
import { getClient } from "@/app/lib/client";

export class StrategyService {
    // --- PLAN ON A PAGE ---
    static async getPlanOnAPage() {
        const frappe = await getClient();
        return (frappe.db() as any).get_doc("Plan On A Page", "Plan On A Page");
    }

    static async updatePlanOnAPage(data: any) {
        const frappe = await getClient();
        return (frappe.db() as any).update_doc("Plan On A Page", "Plan On A Page", data);
    }

    // --- VISION ---
    static async getVisions() {
        return BaseService.getList("Vision", {
            fields: ["name", "title", "description"],
            order_by: "modified desc"
        });
    }

    static async getVision(name: string) {
        return BaseService.getDoc("Vision", name);
    }

    static async createVision(data: any) {
        return BaseService.insert({ doctype: "Vision", ...data });
    }

    static async updateVision(name: string, data: any) {
        return BaseService.setValue("Vision", name, data);
    }

    static async deleteVision(name: string) {
        return BaseService.delete("Vision", name);
    }

    // --- PILLAR ---
    static async getPillars(visionName?: string) {
        const filters = visionName ? { vision: visionName } : {};
        return BaseService.getList("Pillar", {
            fields: ["name", "title", "description", "vision"],
            filters: filters,
            order_by: "modified desc"
        });
    }

    static async createPillar(data: any) {
        return BaseService.insert({ doctype: "Pillar", ...data });
    }

    static async updatePillar(name: string, data: any) {
        return BaseService.setValue("Pillar", name, data);
    }

    static async deletePillar(name: string) {
        return BaseService.delete("Pillar", name);
    }

    // --- STRATEGIC OBJECTIVE ---
    static async getStrategicObjectives(pillarName?: string) {
        const filters = pillarName ? { pillar: pillarName } : {};
        return BaseService.getList("Strategic Objective", {
            fields: ["name", "title", "description", "pillar"],
            filters: filters,
            order_by: "modified desc"
        });
    }

    static async createStrategicObjective(data: any) {
        return BaseService.insert({ doctype: "Strategic Objective", ...data });
    }

    static async updateStrategicObjective(name: string, data: any) {
        return BaseService.setValue("Strategic Objective", name, data);
    }

    static async deleteStrategicObjective(name: string) {
        return BaseService.delete("Strategic Objective", name);
    }

    // --- KPI ---
    static async getKPIs(objectiveName?: string) {
        const filters = objectiveName ? { strategic_objective: objectiveName } : {};
        return BaseService.getList("KPI", {
            fields: ["name", "title", "description", "strategic_objective"],
            filters: filters,
            order_by: "modified desc"
        });
    }

    static async createKPI(data: any) {
        return BaseService.insert({ doctype: "KPI", ...data });
    }

    static async updateKPI(name: string, data: any) {
        return BaseService.setValue("KPI", name, data);
    }

    static async deleteKPI(name: string) {
        return BaseService.delete("KPI", name);
    }

    // --- PERSONAL MASTERY GOAL ---
    static async getPersonalMasteryGoals() {
        return BaseService.getList("Personal Mastery Goal", {
            fields: ["name", "title", "description"],
            order_by: "modified desc"
        });
    }

    static async createPersonalMasteryGoal(data: any) {
        return BaseService.insert({ doctype: "Personal Mastery Goal", ...data });
    }

    static async updatePersonalMasteryGoal(name: string, data: any) {
        return BaseService.setValue("Personal Mastery Goal", name, data);
    }

    static async deletePersonalMasteryGoal(name: string) {
        return BaseService.delete("Personal Mastery Goal", name);
    }
}

