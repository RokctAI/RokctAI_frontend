export interface AssetValueAdjustmentData {
    asset: string;
    date: string;
    current_asset_value: number;
    new_asset_value: number;
    difference_account?: string;
}
