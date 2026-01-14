import { getMyTimesheets } from "@/app/actions/handson/all/projects/me/timesheets";
import { TimesheetList } from "@/components/handson/timesheet-components";

export const dynamic = "force-dynamic";

export default async function MyTimesheetsPage() {
    const timesheets = await getMyTimesheets();
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">My Timesheets</h1>
            <TimesheetList items={timesheets} />
        </div>
    );
}
