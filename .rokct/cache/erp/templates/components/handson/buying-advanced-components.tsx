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
import { useRouter } from "next/navigation";
import { createRFQ } from "@/app/actions/handson/all/accounting/buying/rfq";
import { createSupplierQuotation } from "@/app/actions/handson/all/accounting/buying/supplier";
import { createQualityInspection } from "@/app/actions/handson/all/accounting/buying/quality";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import t from "@/app/lib/i18n";
// --- RFQ ---
export function RFQList({ items }: { items: any[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("erp.request_for_quotation")}</h1>
        </div>
        <Link href="/handson/all/supply_chain/buying/rfq/new">
          <Button>
            <RiAddLine className="mr-2 h-4 w-4" /> {t("erp.new_rfq")}
          </Button>
        </Link>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("erp.name")}</TableHead>
              <TableHead>{t("erp.date")}</TableHead>
              <TableHead>{t("erp.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((i) => (
              <TableRow key={i.name}>
                <TableCell>{i.name}</TableCell>
                <TableCell>{i.transaction_date}</TableCell>
                <TableCell>{i.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function RFQForm() {
  const router = useRouter();
  const [supplier, setSupplier] = useState("");
  const [item, setItem] = useState("");
  const handleSubmit = async () => {
    const res = await createRFQ({
      transaction_date: new Date().toISOString().split("T")[0],
      suppliers: [{ supplier }],
      items: [{ item_code: item, qty: 1 }],
    });
    if (res.success) {
      toast.success("Created");
      router.push("/handson/all/supply_chain/buying/rfq");
    } else toast.error(res.error);
  };
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div>
            <Label>{t("erp.supplier")}</Label>
            <Input
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
          </div>
          <div>
            <Label>{t("erp.item")}</Label>
            <Input value={item} onChange={(e) => setItem(e.target.value)} />
          </div>
          <Button onClick={handleSubmit}>{t("erp.create_rfq")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}

// --- SUPPLIER QUOTATION ---
export function SupplierQuotationList({ items }: { items: any[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("erp.supplier_quotation")}</h1>
        </div>
        <Link href="/handson/all/supply_chain/buying/supplier-quotation/new">
          <Button>
            <RiAddLine className="mr-2 h-4 w-4" /> {t("erp.new_quote")}
          </Button>
        </Link>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("erp.name")}</TableHead>
              <TableHead>{t("erp.supplier")}</TableHead>
              <TableHead>{t("erp.total")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((i) => (
              <TableRow key={i.name}>
                <TableCell>{i.name}</TableCell>
                <TableCell>{i.supplier}</TableCell>
                <TableCell>{i.grand_total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function SupplierQuotationForm() {
  const router = useRouter();
  const [supplier, setSupplier] = useState("");
  const [item, setItem] = useState("");
  const [rate, setRate] = useState(0);
  const handleSubmit = async () => {
    const res = await createSupplierQuotation({
      supplier,
      items: [{ item_code: item, qty: 1, rate }],
    });
    if (res.success) {
      toast.success("Created");
      router.push("/handson/all/supply_chain/buying/supplier-quotation");
    } else toast.error(res.error);
  };
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div>
            <Label>{t("erp.supplier")}</Label>
            <Input
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
          </div>
          <div>
            <Label>{t("erp.item")}</Label>
            <Input value={item} onChange={(e) => setItem(e.target.value)} />
          </div>
          <div>
            <Label>{t("erp.rate")}</Label>
            <Input
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
          </div>
          <Button onClick={handleSubmit}>{t("erp.create_quote")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}

// --- QUALITY INSPECTION ---
export function QualityInspectionList({ items }: { items: any[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("erp.quality_inspection")}</h1>
        </div>
        <Link href="/handson/all/supply_chain/buying/quality/new">
          <Button>
            <RiAddLine className="mr-2 h-4 w-4" /> {t("erp.new_inspection")}
          </Button>
        </Link>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("erp.name")}</TableHead>
              <TableHead>{t("erp.ref_type")}</TableHead>
              <TableHead>{t("erp.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((i) => (
              <TableRow key={i.name}>
                <TableCell>{i.name}</TableCell>
                <TableCell>{i.reference_type}</TableCell>
                <TableCell>{i.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function QualityInspectionForm() {
  const router = useRouter();
  const [type, setType] = useState("Purchase Receipt");
  const [ref, setRef] = useState("");
  const handleSubmit = async () => {
    const res = await createQualityInspection({
      reference_type: type,
      reference_name: ref,
      status: "Accepted",
    });
    if (res.success) {
      toast.success("Created");
      router.push("/handson/all/supply_chain/buying/quality");
    } else toast.error(res.error);
  };
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div>
            <Label>{t("erp.ref_type")}</Label>
            <Input value={type} onChange={(e) => setType(e.target.value)} />
          </div>
          <div>
            <Label>{t("erp.ref_name")}</Label>
            <Input value={ref} onChange={(e) => setRef(e.target.value)} />
          </div>
          <Button onClick={handleSubmit}>{t("erp.create_inspection")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
