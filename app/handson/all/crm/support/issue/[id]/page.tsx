import { getIssue } from "@/app/actions/handson/all/crm/support/issue";
import { IssueForm } from "@/components/handson/issue-form";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
    const data = await getIssue(params.id);
    if (!data) notFound();
    return <div className="p-6"><IssueForm initialData={data} isEdit={true} /></div>;
}
