import { getShopFloorItems } from "@/app/actions/handson/all/accounting/manufacturing/shop_floor";
import { ShopFloorList } from "@/components/handson/shop-floor-components";
import { TableRow, TableCell } from "@/components/ui/table";

export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getShopFloorItems("Operation");
    return (
        <div className="p-6">
            <ShopFloorList
                title="Operations"
                items={data}
                newItemUrl="/handson/all/supply_chain/manufacturing/shop-floor/operation/new"
                headers={["Name"]}
                renderRow={(item: any) => <TableRow key={item.name}><TableCell>{item.name}</TableCell></TableRow>}
            />
        </div>
    );
}
