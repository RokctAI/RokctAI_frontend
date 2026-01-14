import { getStockReconciliations } from "@/app/actions/handson/all/accounting/inventory/stock";
import { SimpleList } from "@/components/handson/stock-advanced-components";
import { TableRow, TableCell } from "@/components/ui/table";
export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getStockReconciliations();
    return <div className="p-6"><SimpleList title="Stock Reconciliation" items={data} newItemUrl="/handson/all/supply_chain/stock/reconciliation/new" headers={["Name", "Purpose", "Date"]} renderRow={(i: any) => <TableRow key={i.name}><TableCell>{i.name}</TableCell><TableCell>{i.purpose}</TableCell><TableCell>{i.posting_date}</TableCell></TableRow>} /></div>;
}
