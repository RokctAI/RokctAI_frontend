import { getPayments } from "@/app/actions/handson/all/accounting/payments/getPayments";
import { PaymentEntryList } from "@/components/handson/payment-entry-components";

export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getPayments();
    return <div className="p-6"><PaymentEntryList items={data} /></div>;
}
