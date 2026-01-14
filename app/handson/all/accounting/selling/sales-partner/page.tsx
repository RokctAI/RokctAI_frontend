import { getSalesPartners } from "@/app/actions/handson/all/accounting/selling/extras";
import { SimpleList } from "@/components/handson/commercial-extras-components";
import { TableRow, TableCell } from "@/components/ui/table";
export const dynamic = "force-dynamic";
export default async function Page() {
    const data = await getSalesPartners();
    return <div className="p-6"><SimpleList title="Sales Partners" items={data} newItemUrl="/handson/all/commercial/selling/sales-partner/new" headers={["Name", "Commission %", "Type"]} renderRow={(i: any) => <TableRow key={i.name}><TableCell>{i.partner_name}</TableCell><TableCell>{i.commission_rate}%</TableCell><TableCell>{i.partner_type}</TableCell></TableRow>} /></div>;
}
