import { BaseService } from "@/app/services/common/base";
import { BudgetData } from "@/app/actions/handson/all/accounting/budgets/types";

export class BudgetService {
    static async getList(options?: any) {
        return BaseService.getList("Budget", {
            fields: ["name", "budget_against", "cost_center", "project", "fiscal_year"],
            limit_page_length: 50,
            ...options
        });
    }

    static async create(data: BudgetData) {
        return BaseService.insert({ doctype: "Budget", ...data });
    }
}
