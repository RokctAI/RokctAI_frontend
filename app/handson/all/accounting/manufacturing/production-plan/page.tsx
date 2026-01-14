import { getProductionPlans } from "@/app/actions/handson/all/accounting/manufacturing/production_plan";
import { ProductionPlanList } from "@/components/handson/production-plan-components";

export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getProductionPlans();
    return <div className="p-6"><ProductionPlanList plans={data} /></div>;
}
