import { getIssues } from "@/app/actions/handson/all/crm/support/issue";
import { IssueList } from "@/components/handson/issue-list";

export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getIssues();
    return <div className="p-6"><IssueList issues={data} /></div>;
}
