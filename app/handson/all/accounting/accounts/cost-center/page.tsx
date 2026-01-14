import { getCostCenters } from "@/app/actions/handson/all/accounting/cost_centers/getCostCenters";
import { CostCenterList } from "@/components/handson/cost-center-components";

export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getCostCenters();
    return <div className="p-6"><CostCenterList items={data} /></div>;
}
