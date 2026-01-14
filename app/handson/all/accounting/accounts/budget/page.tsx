import { getBudgets } from "@/app/actions/handson/all/accounting/budgets/getBudgets";
import { BudgetList } from "@/components/handson/budget-components";

export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getBudgets();
    return <div className="p-6"><BudgetList items={data} /></div>;
}
