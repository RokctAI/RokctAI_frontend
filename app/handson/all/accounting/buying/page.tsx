import { getPurchaseOrders } from "@/app/actions/handson/all/accounting/buying/order";
import { getSuppliers } from "@/app/actions/handson/all/accounting/buying/supplier";
import { BuyingDashboard } from "@/components/handson/buying-dashboard";
import { verifySupplyChainRole } from "@/app/lib/roles";

export const dynamic = "force-dynamic";

export default async function BuyingPage() {
    const [orders, suppliers, isAllowed] = await Promise.all([
        getPurchaseOrders(),
        getSuppliers(),
        verifySupplyChainRole()
    ]);

    return (
        <div className="p-6">
            <BuyingDashboard orders={orders} suppliers={suppliers} canEdit={isAllowed} />
        </div>
    );
}
