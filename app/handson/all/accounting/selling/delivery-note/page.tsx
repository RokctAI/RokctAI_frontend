import { getDeliveryNotes } from "@/app/actions/handson/all/accounting/selling/delivery_note";
import { DeliveryNoteList } from "@/components/handson/delivery-note-components";

export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getDeliveryNotes();
    return <div className="p-6"><DeliveryNoteList notes={data} /></div>;
}
