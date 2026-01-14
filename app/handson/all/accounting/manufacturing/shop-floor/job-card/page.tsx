import { getShopFloorItems } from "@/app/actions/handson/all/accounting/manufacturing/shop_floor";
import { ShopFloorList } from "@/components/handson/shop-floor-components";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getShopFloorItems("Job Card");
    return (
        <div className="p-6">
            <ShopFloorList
                title="Job Cards"
                items={data}
                newItemUrl="/handson/all/supply_chain/manufacturing/shop-floor/job-card/new"
                headers={["Name", "Work Order", "Operation", "Station", "Status"]}
                renderRow={(item: any) => <TableRow key={item.name}><TableCell>{item.name}</TableCell><TableCell>{item.work_order}</TableCell><TableCell>{item.operation}</TableCell><TableCell>{item.workstation}</TableCell><TableCell><Badge variant="outline">{item.status}</Badge></TableCell></TableRow>}
            />
        </div>
    );
}
