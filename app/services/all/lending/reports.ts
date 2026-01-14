import { BaseService, ServiceOptions } from "@/app/services/common/base";

export class ReportService {
    static async getReport(reportName: string, filters: any = {}, options?: ServiceOptions) {
        const response = await BaseService.call("frappe.desk.query_report.run", {
            report_name: reportName,
            filters: filters
        }, options);

        return {
            columns: response?.message?.columns || [],
            data: response?.message?.result || [],
            message: response?.message?.message
        };
    }
}
