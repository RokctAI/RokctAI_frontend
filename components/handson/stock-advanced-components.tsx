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

"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import {
  createStockReconciliation,
  createLandedCostVoucher,
} from "@/app/actions/handson/all/accounting/inventory/stock";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// --- GENERIC LIST ---
export function SimpleList({
  title,
  items,
  newItemUrl,
  headers,
  renderRow,
}: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        {newItemUrl && (
          <Link href={newItemUrl}>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New
            </Button>
          </Link>
        )}
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((h: any) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>{items.map((item: any) => renderRow(item))}</TableBody>
        </Table>
      </div>
    </div>
  );
}

// --- RECONCILIATION ---
export function StockReconciliationForm() {
  const router = useRouter();
  const [item, setItem] = useState("");
  const [qty, setQty] = useState(0);
  const [rate, setRate] = useState(0);
  const handleSubmit = async () => {
    const res = await createStockReconciliation({
      purpose: "Stock Reconciliation",
      items: [{ item_code: item, qty, valuation_rate: rate }],
    });
    if (res.success) {
      toast.success("Created");
      router.push("/handson/all/supply_chain/stock/reconciliation");
    } else toast.error(res.error);
  };
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div>
            <Label>Item</Label>
            <Input value={item} onChange={(e) => setItem(e.target.value)} />
          </div>
          <div>
            <Label>Actual Qty</Label>
            <Input
              type="number"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Rate</Label>
            <Input
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
          </div>
          <Button onClick={handleSubmit}>Reconcile</Button>
        </CardContent>
      </Card>
    </div>
  );
}

// --- LANDED COST ---
export function LandedCostForm() {
  const router = useRouter();
  const [ref, setRef] = useState("");
  const handleSubmit = async () => {
    const res = await createLandedCostVoucher({
      receipt_document_type: "Purchase Receipt",
      receipt_document: ref,
      charges: [],
    });
    if (res.success) {
      toast.success("Created");
      router.push("/handson/all/supply_chain/stock/landed-cost");
    } else toast.error(res.error);
  };
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div>
            <Label>Purchase Receipt</Label>
            <Input value={ref} onChange={(e) => setRef(e.target.value)} />
          </div>
          <Button onClick={handleSubmit}>Create Voucher</Button>
        </CardContent>
      </Card>
    </div>
  );
}
