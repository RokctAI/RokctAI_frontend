import { BaseService } from "@/app/services/common/base";

export interface StandardReportDef {
    name: string;
    title: string;
    description: string;
    doctype: string;
    category: "Financial" | "Sales" | "Stock" | "Project";
    defaultColumns: string[];
}

export class AnalyticsService {
    static async runCustomReport(doctype: string, fields: string[], filters: any = {}) {
        const response = await BaseService.getList(doctype, {
            fields: fields,
            filters: filters,
            limit_page_length: 500,
            order_by: "creation desc"
        });
        return response;
    }

    static async executeReportQuery(sql: string) {
        // Basic Security Sanity Check
        const upperSql = sql.toUpperCase();
        if (
            upperSql.includes("DROP ") ||
            upperSql.includes("DELETE ") ||
            upperSql.includes("UPDATE ") ||
            upperSql.includes("INSERT ") ||
            upperSql.includes("ALTER ") ||
            upperSql.includes("TRUNCATE ") ||
            upperSql.includes("GRANT ")
        ) {
            throw new Error("Security Error: Only SELECT queries are allowed.");
        }

        const response = await BaseService.call("frappe.client.get_sql", {
            query: sql,
            as_dict: 1
        });
        return response?.message;
    }
}
