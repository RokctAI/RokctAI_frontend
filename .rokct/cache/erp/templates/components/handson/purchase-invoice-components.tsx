/*
 * Copyright (c) 2026 ROKCT INTELLIGENCE (PTY) LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

"use client";
import { useState } from "react";
import Link from "next/link";
import { RiAddLine } from "@remixicon/react";
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
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { createPurchaseInvoice } from "@/app/actions/handson/all/accounting/purchases/createPurchaseInvoice";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import t from "@/app/lib/i18n";
export function PurchaseInvoiceList({ invoices }: { invoices: any[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("erp.purchase_invoices")}</h1>
          <p className="text-muted-foreground">{t("erp.bills_from_suppliers")}</p>
        </div>
        <Link href="/handson/all/financials/accounts/purchase-invoice/new">
          <Button>
            <RiAddLine className="mr-2 h-4 w-4" /> {t("erp.new_invoice")}
          </Button>
        </Link>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("erp.name")}</TableHead>
              <TableHead>{t("erp.supplier")}</TableHead>
              <TableHead>{t("erp.date")}</TableHead>
              <TableHead>{t("erp.total")}</TableHead>
              <TableHead>{t("erp.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.name}>
                <TableCell>{inv.name}</TableCell>
                <TableCell>{inv.supplier_name}</TableCell>
                <TableCell>{inv.posting_date}</TableCell>
                <TableCell>{inv.grand_total}</TableCell>
                <TableCell>
                  <Badge variant="outline">{inv.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function PurchaseInvoiceForm() {
  const router = useRouter();
  const [supplier, setSupplier] = useState("");
  const [item, setItem] = useState("");
  const [qty, setQty] = useState(1);
  const [rate, setRate] = useState(0);

  const handleSubmit = async () => {
    const res = await createPurchaseInvoice({
      supplier,
      posting_date: new Date().toISOString().split("T")[0],
      items: [{ item_code: item, qty, rate }],
    });
    if (res.success) {
      toast.success("Invoice Created");
      router.push("/handson/all/financials/accounts/purchase-invoice");
    } else toast.error(res.error);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{t("erp.new_purchase_invoice")}</h1>
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div>
            <Label>{t("erp.supplier")}</Label>
            <Input
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder={t("erp.supplier_name")}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>{t("erp.item")}</Label>
              <Input value={item} onChange={(e) => setItem(e.target.value)} />
            </div>
            <div className="w-24">
              <Label>{t("erp.qty")}</Label>
              <Input
                type="number"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
            </div>
            <div className="w-32">
              <Label>{t("erp.rate")}</Label>
              <Input
                type="number"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
              />
            </div>
          </div>
          <Button onClick={handleSubmit}>{t("erp.create_invoice")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
