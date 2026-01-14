import { getStockLedgerEntries } from "@/app/actions/handson/all/accounting/inventory/stock";
import { SimpleList } from "@/components/handson/stock-advanced-components";
import { TableRow, TableCell } from "@/components/ui/table";
export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getStockLedgerEntries();
    return <div className="p-6"><SimpleList title="Stock Ledger" items={data} headers={["Item", "Qty", "Rate", "Voucher"]} renderRow={(i: any) => <TableRow key={i.name}><TableCell>{i.item_code}</TableCell><TableCell>{i.actual_qty}</TableCell><TableCell>{i.valuation_rate}</TableCell><TableCell>{i.voucher_type} - {i.voucher_no}</TableCell></TableRow>} /></div>;
}
