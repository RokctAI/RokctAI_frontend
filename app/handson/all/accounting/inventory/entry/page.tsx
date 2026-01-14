import { getStockEntries } from "@/app/actions/handson/all/accounting/inventory/stock";
import { StockEntryList } from "@/components/handson/stock-entry-list";

export const dynamic = "force-dynamic";

export default async function StockEntryPage() {
    const entries = await getStockLedgerEntries();
    return <div className="p-6"><StockEntryList entries={entries} /></div>;
}
