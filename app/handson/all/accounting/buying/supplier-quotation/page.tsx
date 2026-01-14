import { getSupplierQuotations } from "@/app/actions/handson/all/accounting/buying/supplier";
import { SupplierQuotationList } from "@/components/handson/buying-advanced-components";
export const dynamic = "force-dynamic";
export default async function Page() { const data = await getSupplierQuotations(); return <div className="p-6"><SupplierQuotationList items={data} /></div>; }
