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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function PurchaseReceiptList({ receipts }: { receipts: any[] }) {
  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("erp.purchase_receipts")}</h1>
        <Link href="/handson/all/supply_chain/buying/receipt/new">
          <Button>
            <RiAddLine className="mr-2 h-4 w-4" /> {t("erp.receive_goods")}
          </Button>
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("erp.name")}</TableHead>
            <TableHead>{t("erp.supplier")}</TableHead>
            <TableHead>{t("erp.date")}</TableHead>
            <TableHead>{t("erp.total")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receipts.map((r) => (
            <TableRow key={r.name}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.supplier}</TableCell>
              <TableCell>{r.posting_date}</TableCell>
              <TableCell>{r.grand_total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Minimal Form for brevity, assuming similar structure to others
import { useRouter } from "next/navigation";
import { createPurchaseReceipt } from "@/app/actions/handson/all/accounting/buying/receipt";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

import t from "@/app/lib/i18n";
export function PurchaseReceiptForm() {
  const router = useRouter();
  const [supplier, setSupplier] = useState("");
  const [item, setItem] = useState("");
  const [qty, setQty] = useState(1);
  const [rate, setRate] = useState(0);

  const handleSubmit = async () => {
    const res = await createPurchaseReceipt({
      supplier,
      company: "Juvo",
      posting_date: new Date().toISOString().split("T")[0],
      items: [{ item_code: item, qty: qty, rate: rate }],
    });
    if (res.success) {
      toast.success("Received");
      router.push("/handson/all/supply_chain/buying/receipt");
    } else toast.error(res.error || "Failed");
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{t("erp.new_purchase_receipt")}</h1>
      <div className="space-y-2 border p-4 rounded bg-white">
        <div>
          <label className="text-sm font-medium">{t("erp.supplier")}</label>
          <Input
            placeholder={t("erp.supplier_name")}
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">{t("erp.item_code")}</label>
          <Input
            placeholder={t("erp.item_code")}
            value={item}
            onChange={(e) => setItem(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium">{t("erp.qty")}</label>
            <Input
              type="number"
              placeholder={t("erp.qty")}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium">{t("erp.rate")}</label>
            <Input
              type="number"
              placeholder={t("erp.rate")}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
      <Button onClick={handleSubmit} className="w-full">
        {t("erp.create_receipt")}
      </Button>
    </div>
  );
}
