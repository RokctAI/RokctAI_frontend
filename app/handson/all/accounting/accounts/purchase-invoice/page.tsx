import { getPurchaseInvoices } from "@/app/actions/handson/all/accounting/purchases/getPurchaseInvoices";
import { PurchaseInvoiceList } from "@/components/handson/purchase-invoice-components";

export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getPurchaseInvoices();
    return <div className="p-6"><PurchaseInvoiceList invoices={data} /></div>;
}
