import { getSubcontractingReceipts } from "@/app/actions/handson/all/accounting/buying/subcontracting";
import { SubcontractingReceiptList } from "@/components/handson/subcontracting-receipt-components";

export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getSubcontractingReceipts();
    return <div className="p-6"><SubcontractingReceiptList receipts={data} /></div>;
}
