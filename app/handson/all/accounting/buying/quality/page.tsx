import { getQualityInspections } from "@/app/actions/handson/all/accounting/buying/quality";
import { QualityInspectionList } from "@/components/handson/buying-advanced-components";
export const dynamic = "force-dynamic";
export default async function Page() { const data = await getQualityInspections(); return <div className="p-6"><QualityInspectionList items={data} /></div>; }
