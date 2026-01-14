import { getShippingRules } from "@/app/actions/handson/all/accounting/selling/extras";
import { SimpleList } from "@/components/handson/commercial-extras-components";
import { TableRow, TableCell } from "@/components/ui/table";
export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getShippingRules();
    return <div className="p-6"><SimpleList title="Shipping Rules" items={data} newItemUrl="/handson/all/commercial/selling/shipping-rule/new" headers={["Label", "Method", "Amount"]} renderRow={(i: any) => <TableRow key={i.name}><TableCell>{i.label}</TableCell><TableCell>{i.calculate_based_on}</TableCell><TableCell>{i.shipping_amount}</TableCell></TableRow>} /></div>;
}
