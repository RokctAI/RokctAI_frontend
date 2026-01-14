export interface AssetData {
    asset_name: string;
    item_code: string;
    gross_purchase_amount: number;
    purchase_date: string;
    company: string;
    location?: string;
    status?: string;
    asset_owner?: string;
    custodian?: string; // Employee
}
