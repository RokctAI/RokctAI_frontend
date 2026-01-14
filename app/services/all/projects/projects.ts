import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class ProjectService {
    static async getList(options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get_list", {
            doctype: "Project",
            fields: ["name", "project_name", "status", "priority", "percent_complete", "expected_end_date"],
            limit_page_length: 50,
            order_by: "creation desc"
        }, options);
        return response?.message || [];
    }

    static async get(name: string, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.get", {
            doctype: "Project",
            name: name
        }, options);
        return response?.message;
    }

    static async create(data: any, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.insert", {
            doc: { doctype: "Project", ...data }
        }, options);
        return response?.message;
    }

    static async update(name: string, data: any, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.client.set_value", {
            doctype: "Project",
            name: name,
            fieldname: data
        }, options);
        return response?.message;
    }

    static async delete(name: string, options?: ServiceOptions) {
        await BaseService.call("frappe.client.delete", {
            doctype: "Project",
            name: name
        }, options);
    }

    static async clone(projectId: string, newName: string, options?: ServiceOptions) {
        // 1. Fetch Original Project
        const project = await BaseService.getDoc("Project", projectId, options);
        if (!project) throw new Error("Original project not found");

        // 2. Create New Project
        const newProjectData = {
            doctype: "Project",
            project_name: newName,
            status: "Open",
            priority: project.priority,
            department: project.department,
            project_type: project.project_type,
            expected_start_date: new Date().toISOString().split('T')[0], // Reset dates
        };

        const createRes = await BaseService.insert(newProjectData, options);
        const newProjectId = createRes.name;

        // 3. Clone Tasks
        const tasks = await BaseService.call("frappe.client.get_list", {
            doctype: "Task",
            filters: { project: projectId },
            fields: ["subject", "status", "priority", "description", "exp_start_date", "exp_end_date"],
            limit_page_length: 100
        }, options);

        if (tasks && tasks.message) {
            for (const task of tasks.message) {
                await BaseService.insert({
                    doctype: "Task",
                    project: newProjectId,
                    subject: task.subject,
                    status: "Open",
                    priority: task.priority,
                    description: task.description,
                    exp_start_date: new Date().toISOString().split('T')[0],
                }, options);
            }
        }

        return newProjectId;
    }
}
