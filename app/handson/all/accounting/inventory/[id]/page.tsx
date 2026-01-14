import { getItem } from "@/app/actions/handson/all/accounting/inventory/item";
import { ItemForm } from "@/components/handson/item-form";
import { notFound } from "next/navigation";

interface PageProps {
    params: { id: string };
}

export default async function EditItemPage({ params }: PageProps) {
    // Decoding the ID because Item Codes might contain slashes or spaces
    const itemCode = decodeURIComponent(params.id);
    const item = await getItem(itemCode);

    if (!item) {
        notFound();
    }

    return (
        <div className="p-6">
            <ItemForm initialData={item} isEdit={true} />
        </div>
    );
}
