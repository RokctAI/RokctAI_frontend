/*
 * Copyright (c) 2026 RokctAI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {
  getBatches,
  getSerialNos,
} from "@/app/actions/handson/all/accounting/inventory/batch_serial";
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
          <SimpleList
            title="Batches"
            items={batches}
            headers={["Batch ID", "Item", "Expiry"]}
            renderRow={(i: any) => (
              <TableRow key={i.name}>
                <TableCell>{i.batch_id}</TableCell>
                <TableCell>{i.item}</TableCell>
                <TableCell>{i.expiry_date}</TableCell>
              </TableRow>
            )}
          />
        </TabsContent>
        <TabsContent value="serials">
          <SimpleList
            title="Serial Nos"
            items={serials}
            headers={["Serial No", "Item", "Status"]}
            renderRow={(i: any) => (
              <TableRow key={i.name}>
                <TableCell>{i.serial_no}</TableCell>
                <TableCell>{i.item_code}</TableCell>
                <TableCell>{i.status}</TableCell>
              </TableRow>
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
