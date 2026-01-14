import { getAssets } from "@/app/actions/handson/all/accounting/assets/getAssets";
import { getEmployees } from "@/app/actions/handson/all/hrms/employees";
import { AssetList } from "@/components/handson/asset-list";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
    const [assets, employees] = await Promise.all([
        getAssets(),
        getEmployees()
    ]);

    return (
        <div className="p-6">
            <AssetList assets={assets} employees={employees} />
        </div>
    );
}
