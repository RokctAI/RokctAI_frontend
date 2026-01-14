import { getAssetMaintenances } from "@/app/actions/handson/all/accounting/assets/maintenance/getAssetMaintenances";
import { AssetMaintenanceList } from "@/components/handson/asset-maintenance-components";

export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getAssetMaintenances();
    return <div className="p-6"><AssetMaintenanceList items={data} /></div>;
}
