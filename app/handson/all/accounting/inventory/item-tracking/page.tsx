import { getBatches, getSerialNos } from "@/app/actions/handson/all/accounting/inventory/batch_serial";
import { SimpleList } from "@/components/handson/stock-advanced-components";
import { TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";
export default async function Page() {
    const batches = await getBatches();
    const serials = await getSerialNos();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Item Tracking</h1>
            <Tabs defaultValue="batches">
                <TabsList>
                    <TabsTrigger value="batches">Batches</TabsTrigger>
                    <TabsTrigger value="serials">Serial Nos</TabsTrigger>
                </TabsList>
                <TabsContent value="batches">
                    <SimpleList title="Batches" items={batches} headers={["Batch ID", "Item", "Expiry"]} renderRow={(i: any) => <TableRow key={i.name}><TableCell>{i.batch_id}</TableCell><TableCell>{i.item}</TableCell><TableCell>{i.expiry_date}</TableCell></TableRow>} />
                </TabsContent>
                <TabsContent value="serials">
                    <SimpleList title="Serial Nos" items={serials} headers={["Serial No", "Item", "Status"]} renderRow={(i: any) => <TableRow key={i.name}><TableCell>{i.serial_no}</TableCell><TableCell>{i.item_code}</TableCell><TableCell>{i.status}</TableCell></TableRow>} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
