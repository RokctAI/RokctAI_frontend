import { getSalesInvoices } from "@/app/actions/handson/all/accounting/invoices/getSalesInvoices";
import { getPurchaseInvoices } from "@/app/actions/handson/all/accounting/purchases/getPurchaseInvoices";

import { AccountsDashboard } from "@/components/handson/accounts-dashboard";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
    const [salesInvoices, purchaseInvoices] = await Promise.all([
        getSalesInvoices(),
        getPurchaseInvoices()
    ]);

    return (
        <div className="p-6">
            <AccountsDashboard salesInvoices={salesInvoices} purchaseInvoices={purchaseInvoices} />
        </div>
    );
}
