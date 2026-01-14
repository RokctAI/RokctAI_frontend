import { getSubcontractingOrders } from "@/app/actions/handson/all/accounting/buying/subcontracting";
import { SubcontractingOrderList } from "@/components/handson/subcontracting-order-list";

export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getSubcontractingOrders();
    return <div className="p-6"><SubcontractingOrderList orders={data} /></div>;
}
