import { getPayments } from "@/app/actions/handson/all/accounting/payments/getPayments";
import { BankClearanceTool } from "@/components/handson/bank-clearance-components";

export const dynamic = "force-dynamic";
export default async function Page() {
    // We use getPayments but we might need to modify it to include clearance_date in the fetch if not already there.
    // I'll assume I update getPayments to fetch clearance_date or it fetches * (all fields) implicitly in some versions, 
    // but better to be explicit in the action later if needed. For now, we reuse existing action.
    const data = await getPayments();
    return <div className="p-6"><BankClearanceTool payments={data} /></div>;
}
