import { ControlBaseService } from "./base";

export class TenderService {
    static async getTenderControlSettings() {
        return ControlBaseService.getList("Tender Control Settings", {
            fields: ["name", "default_workflow"],
            limit: 1
        });
    }

    static async getGeneratedTenderTasks() {
        return ControlBaseService.getList("Generated Tender Task", {
            fields: ["name", "tender", "task_name", "status"],
            order_by: "modified desc"
        });
    }

    static async getTenderWorkflowTasks() {
        return ControlBaseService.getList("Tender Workflow Task", {
            fields: ["name", "workflow", "task_description", "assigned_to"],
            order_by: "modified desc"
        });
    }

    static async getTenderWorkflowTemplates() {
        return ControlBaseService.getList("Tender Workflow Template", {
            fields: ["name", "template_name", "created_by"],
            order_by: "modified desc"
        });
    }

    static async getIntelligentTaskSets() {
        return ControlBaseService.getList("Intelligent Task Set", {
            fields: ["name", "set_name", "description"],
            order_by: "modified desc"
        });
    }

    static async updateTenderControlSettings(name: string, data: any) {
        return ControlBaseService.update("Tender Control Settings", name, data);
    }

    static async createGeneratedTenderTask(data: any) {
        return ControlBaseService.insert({ doctype: "Generated Tender Task", ...data });
    }

    static async updateGeneratedTenderTask(name: string, data: any) {
        return ControlBaseService.update("Generated Tender Task", name, data);
    }

    static async deleteGeneratedTenderTask(name: string) {
        return ControlBaseService.delete("Generated Tender Task", name);
    }

    static async createTenderWorkflowTask(data: any) {
        return ControlBaseService.insert({ doctype: "Tender Workflow Task", ...data });
    }

    static async updateTenderWorkflowTask(name: string, data: any) {
        return ControlBaseService.update("Tender Workflow Task", name, data);
    }

    static async deleteTenderWorkflowTask(name: string) {
        return ControlBaseService.delete("Tender Workflow Task", name);
    }

    static async createTenderWorkflowTemplate(data: any) {
        return ControlBaseService.insert({ doctype: "Tender Workflow Template", ...data });
    }

    static async updateTenderWorkflowTemplate(name: string, data: any) {
        return ControlBaseService.update("Tender Workflow Template", name, data);
    }

    static async deleteTenderWorkflowTemplate(name: string) {
        return ControlBaseService.delete("Tender Workflow Template", name);
    }

    static async createIntelligentTaskSet(data: any) {
        return ControlBaseService.insert({ doctype: "Intelligent Task Set", ...data });
    }

    static async updateIntelligentTaskSet(name: string, data: any) {
        return ControlBaseService.update("Intelligent Task Set", name, data);
    }

    static async deleteIntelligentTaskSet(name: string) {
        return ControlBaseService.delete("Intelligent Task Set", name);
    }
}
