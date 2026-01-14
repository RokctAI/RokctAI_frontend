import { getWorkOrders } from "@/app/actions/handson/all/accounting/manufacturing/work_order";
import { WorkOrderList } from "@/components/handson/work-order-list";

export const dynamic = "force-dynamic";

export default async function WorkOrdersPage() {
    const wos = await getWorkOrders();

    return (
        <div className="p-6">
            <WorkOrderList orders={wos} />
        </div>
    );
}
