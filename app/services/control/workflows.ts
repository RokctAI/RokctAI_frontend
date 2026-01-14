import { ControlBaseService } from "./base";
import { getSystemControlClient, getControlClient, getClient } from "@/app/lib/client";

export interface WorkflowRule {
    name?: string;
    doc_type: string;
    description: string;
    conditions: {
        field: string;
        operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "is_empty" | "is_not_empty";
        value?: string;
    }[];
    actions: {
        type: "block_save" | "set_field" | "message";
        field?: string;
        value?: string;
        message?: string;
    }[];
    is_active: boolean;
    min_users?: number;
}

export class WorkflowService {
    static async getGlobalWorkflows(doctype?: string): Promise<WorkflowRule[]> {
        const frappe = await getSystemControlClient();
        const filters: any = { category: "Workflow Rule", is_active: 1 };

        if (doctype) {
            filters.key = ["like", `${doctype}::%`];
        }

        const items = await (frappe.db() as any).get_list("SaaS Configuration Item", {
            filters: filters,
            fields: ["name", "key", "label", "description", "is_active", "creation"],
            limit: 100
        });

        return items.map((item: any) => {
            try {
                const rule = JSON.parse(item.description);
                rule.name = item.name;
                return rule;
            } catch (e) {
                return null;
            }
        }).filter((r: any) => r !== null);
    }

    static async saveGlobalWorkflow(rule: WorkflowRule) {
        const frappe = await getControlClient();
        const key = `${rule.doc_type}::${rule.description.substring(0, 20).replace(/\s+/g, '_')}`;

        if (rule.name) {
            return (frappe.db() as any).set_value("SaaS Configuration Item", rule.name, {
                description: JSON.stringify(rule),
                key: key,
                label: rule.description,
                category: "Workflow Rule",
                region: "All",
                is_active: rule.is_active ? 1 : 0
            });
        } else {
            return (frappe.db() as any).insert({
                doctype: "SaaS Configuration Item",
                category: "Workflow Rule",
                label: rule.description,
                key: key,
                region: "All",
                is_active: rule.is_active ? 1 : 0,
                description: JSON.stringify(rule)
            });
        }
    }

    static async deleteGlobalWorkflow(name: string) {
        return ControlBaseService.delete("SaaS Configuration Item", name);
    }

    static async applyGlobalWorkflows(doctype: string, data: any) {
        const rules = await this.getGlobalWorkflows(doctype);
        let modifiedData = { ...data };

        for (const rule of rules) {
            // Check conditions
            let match = true;
            for (const cond of rule.conditions) {
                const val = modifiedData[cond.field];
                const target = cond.value;

                if (cond.operator === "equals" && val != target) match = false;
                if (cond.operator === "not_equals" && val == target) match = false;
                if (cond.operator === "greater_than" && val <= target) match = false;
                if (cond.operator === "less_than" && val >= target) match = false;
                if (cond.operator === "is_empty" && (val !== null && val !== "" && val !== undefined)) match = false;
                if (cond.operator === "is_not_empty" && (val === null || val === "" || val === undefined)) match = false;
                if (cond.operator === "contains" && !String(val).includes(String(target))) match = false;
            }

            if (match) {
                // Apply actions
                for (const action of rule.actions) {
                    if (action.type === "block_save") {
                        throw new Error(`[Workflow Block] ${action.message || "Action blocked by global workflow rule: " + rule.description}`);
                    }
                    if (action.type === "set_field" && action.field) {
                        modifiedData[action.field] = action.value;
                    }
                }
            }
        }
        return modifiedData;
    }
}
