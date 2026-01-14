import { BaseService } from "@/app/services/common/base";
import { AssetData } from "@/app/actions/handson/all/accounting/assets/types";
import { AssetMaintenanceData } from "@/app/actions/handson/all/accounting/assets/maintenance/types";
import { AssetValueAdjustmentData } from "@/app/actions/handson/all/accounting/assets/value_adjustment/types";

export class AssetService {
    static async getList(options?: any) {
        return BaseService.getList("Asset", {
            fields: ["name", "asset_name", "item_code", "gross_purchase_amount", "purchase_date", "status", "location", "custodian"],
            limit_page_length: 100,
            order_by: "creation desc",
            ...options
        });
    }

    static async get(name: string) {
        return BaseService.getDoc("Asset", name);
    }

    static async create(data: AssetData) {
        return BaseService.insert({ doctype: "Asset", ...data });
    }

    static async update(name: string, data: Partial<AssetData>) {
        return BaseService.setValue("Asset", name, data);
    }

    static async delete(name: string) {
        return BaseService.delete("Asset", name);
    }
}

export class AssetMaintenanceService {
    static async getList(options?: any) {
        return BaseService.getList("Asset Maintenance", {
            fields: ["name", "asset_name", "maintenance_team"],
            limit_page_length: 50,
            ...options
        });
    }

    static async create(data: AssetMaintenanceData) {
        return BaseService.insert({ doctype: "Asset Maintenance", ...data });
    }
}

export class AssetDepreciationService {
    static async getList(options?: any) {
        return BaseService.getList("Asset Depreciation Schedule", {
            fields: ["name", "asset", "finance_book", "status"],
            limit_page_length: 50,
            ...options
        });
    }
}

export class AssetValueAdjustmentService {
    static async getList(options?: any) {
        return BaseService.getList("Asset Value Adjustment", {
            fields: ["name", "asset", "date", "new_asset_value"],
            limit_page_length: 50,
            ...options
        });
    }

    static async create(data: AssetValueAdjustmentData) {
        return BaseService.insert({ doctype: "Asset Value Adjustment", ...data });
    }
}

export class AssetCapitalizationService {
    static async getList(options?: any) {
        return BaseService.getList("Asset Capitalization", {
            fields: ["name", "entry_type", "target_asset", "posting_date"],
            limit_page_length: 50,
            order_by: "creation desc",
            ...options
        });
    }

    static async create(data: any) {
        return BaseService.insert({ doctype: "Asset Capitalization", ...data });
    }
}

export class AssetRepairService {
    static async getList(options?: any) {
        return BaseService.getList("Asset Repair", {
            fields: ["name", "asset", "failure_date", "repair_status", "total_repair_cost"],
            limit_page_length: 50,
            order_by: "creation desc",
            ...options
        });
    }

    static async create(data: any) {
        return BaseService.insert({ doctype: "Asset Repair", ...data });
    }
}

export class AssetMovementService {
    static async getList(options?: any) {
        return BaseService.getList("Asset Movement", {
            fields: ["name", "transaction_date", "company", "purpose"],
            limit_page_length: 50,
            order_by: "creation desc",
            ...options
        });
    }

    static async create(data: any) {
        return BaseService.insert({ doctype: "Asset Movement", ...data });
    }
}
