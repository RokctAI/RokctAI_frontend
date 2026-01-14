import { BaseService } from "@/app/services/common/base";
import { CostCenterData } from "@/app/actions/handson/all/accounting/cost_centers/types";

export class CostCenterService {
    static async getList(options?: any) {
        return BaseService.getList("Cost Center", {
            fields: ["name", "cost_center_name", "parent_cost_center"],
            limit_page_length: 50,
            ...options
        });
    }

    static async create(data: CostCenterData) {
        return BaseService.insert({ doctype: "Cost Center", ...data });
    }
}
