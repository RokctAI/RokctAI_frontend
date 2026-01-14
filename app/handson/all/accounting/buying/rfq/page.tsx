import { getRFQs } from "@/app/actions/handson/all/accounting/buying/rfq";
import { RFQList } from "@/components/handson/buying-advanced-components";
export const dynamic = "force-dynamic";
export default async function Page() { const data = await getRFQs(); return <div className="p-6"><RFQList items={data} /></div>; }
