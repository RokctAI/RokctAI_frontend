import { getSalesOrders } from "@/app/actions/handson/all/accounting/selling/sales_order";
import { SalesOrderList } from "@/components/handson/sales-order-components";

export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getSalesOrders();
    return <div className="p-6"><SalesOrderList orders={data} /></div>;
}
