import { getJournalEntries } from "@/app/actions/handson/all/accounting/journals/getJournalEntries";
import { JournalEntryList } from "@/components/handson/journal-entry-components";

export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getJournalEntries();
    return <div className="p-6"><JournalEntryList items={data} /></div>;
}
