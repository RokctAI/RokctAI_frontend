import { getLandedCostVouchers } from "@/app/actions/handson/all/accounting/inventory/stock";
import { SimpleList } from "@/components/handson/stock-advanced-components";
import { TableRow, TableCell } from "@/components/ui/table";
export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getLandedCostVouchers();
    return <div className="p-6"><SimpleList title="Landed Cost Vouchers" items={data} newItemUrl="/handson/all/supply_chain/stock/landed-cost/new" headers={["Name", "Date", "Total"]} renderRow={(i: any) => <TableRow key={i.name}><TableCell>{i.name}</TableCell><TableCell>{i.posting_date}</TableCell><TableCell>{i.grand_total}</TableCell></TableRow>} /></div>;
}
