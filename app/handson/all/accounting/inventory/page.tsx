import { getItems } from "@/app/actions/handson/all/accounting/inventory/item";
import { ItemList } from "@/components/handson/item-list";

export const dynamic = "force-dynamic";

export default async function StockPage() {
    const items = await getItems();

    return (
        <div className="p-6">
            <ItemList items={items} />
        </div>
    );
}
