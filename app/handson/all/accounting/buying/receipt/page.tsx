import { getPurchaseReceipts } from "@/app/actions/handson/all/accounting/buying/receipt";
import { PurchaseReceiptList } from "@/components/handson/purchase-receipt-components"; // Imported from single file

export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getPurchaseReceipts();
    return <div className="p-6"><PurchaseReceiptList receipts={data} /></div>;
}
