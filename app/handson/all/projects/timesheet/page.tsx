import { getTimesheets } from "@/app/actions/handson/all/projects/timesheets";
import { TimesheetList } from "@/components/handson/timesheet-components";

export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getTimesheets();
    return <div className="p-6"><TimesheetList items={data} /></div>;
}
