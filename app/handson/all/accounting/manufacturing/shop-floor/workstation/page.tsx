import { getShopFloorItems } from "@/app/actions/handson/all/accounting/manufacturing/shop_floor";
import { ShopFloorList } from "@/components/handson/shop-floor-components";
import { TableRow, TableCell } from "@/components/ui/table";

export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getShopFloorItems("Workstation");
    return (
        <div className="p-6">
            <ShopFloorList
                title="Workstations"
                items={data}
                newItemUrl="/handson/all/supply_chain/manufacturing/shop-floor/workstation/new"
                headers={["Name", "Capacity"]}
                renderRow={(item: any) => <TableRow key={item.name}><TableCell>{item.workstation_name}</TableCell><TableCell>{item.production_capacity}</TableCell></TableRow>}
            />
        </div>
    );
}
