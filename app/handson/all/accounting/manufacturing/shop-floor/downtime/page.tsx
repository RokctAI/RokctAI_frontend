import { getShopFloorItems } from "@/app/actions/handson/all/accounting/manufacturing/shop_floor";
import { ShopFloorList } from "@/components/handson/shop-floor-components";
import { TableRow, TableCell } from "@/components/ui/table";

export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getShopFloorItems("Downtime Entry");
    return (
        <div className="p-6">
            <ShopFloorList
                title="Downtime Entries"
                items={data}
                newItemUrl="/handson/all/supply_chain/manufacturing/shop-floor/downtime/new"
                headers={["Station", "Reason", "From", "To"]}
                renderRow={(item: any) => <TableRow key={item.name}><TableCell>{item.workstation}</TableCell><TableCell>{item.stop_reason}</TableCell><TableCell>{item.from_time}</TableCell><TableCell>{item.to_time}</TableCell></TableRow>}
            />
        </div>
    );
}
