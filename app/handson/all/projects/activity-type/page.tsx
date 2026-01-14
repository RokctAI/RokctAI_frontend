import { getActivityTypes } from "@/app/actions/handson/all/projects/timesheets";
import { ActivityTypeList } from "@/components/handson/activity-type-components";

export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getActivityTypes();
    return <div className="p-6"><ActivityTypeList items={data} /></div>;
}
