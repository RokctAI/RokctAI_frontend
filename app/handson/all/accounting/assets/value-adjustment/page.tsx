import { getAssetValueAdjustments } from "@/app/actions/handson/all/accounting/assets/value_adjustment/getAssetValueAdjustments";
import { AssetValueAdjustmentList } from "@/components/handson/asset-value-adjustment-components";

export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getAssetValueAdjustments();
    return <div className="p-6"><AssetValueAdjustmentList items={data} /></div>;
}
