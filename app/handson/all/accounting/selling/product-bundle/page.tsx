import { getProductBundles } from "@/app/actions/handson/all/accounting/selling/extras";
import { SimpleList } from "@/components/handson/commercial-extras-components";
import { TableRow, TableCell } from "@/components/ui/table";
export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getProductBundles();
    return <div className="p-6"><SimpleList title="Product Bundles" items={data} newItemUrl="/handson/all/commercial/selling/product-bundle/new" headers={["Bundle Item", "Description"]} renderRow={(i: any) => <TableRow key={i.name}><TableCell>{i.new_item_code}</TableCell><TableCell>{i.description}</TableCell></TableRow>} /></div>;
}
