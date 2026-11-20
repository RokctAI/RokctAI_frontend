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
import { createPayment } from "@/app/actions/handson/all/accounting/payments/createPayment";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import tr from "@/app/lib/i18n";
export function PaymentEntryList({ items }: { items: any[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{tr("erp.payment_entries")}</h1>
          <p className="text-muted-foreground">
            {tr("erp.incoming_and_outgoing_payments")}
          </p>
        </div>
        <Link href="/handson/all/financials/accounts/payment-entry/new">
          <Button>
            <RiAddLine className="mr-2 h-4 w-4" /> {tr("erp.record_payment")}
          </Button>
        </Link>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tr("erp.type")}</TableHead>
              <TableHead>{tr("erp.party")}</TableHead>
              <TableHead>{tr("erp.amount")}</TableHead>
              <TableHead>{tr("erp.date")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((t) => (
              <TableRow key={t.name}>
                <TableCell>
                  <Badge
                    variant={
                      t.payment_type === "Receive" ? "default" : "secondary"
                    }
                  >
                    {t.payment_type}
                  </Badge>
                </TableCell>
                <TableCell>{t.party_name}</TableCell>
                <TableCell>{t.paid_amount}</TableCell>
                <TableCell>{t.posting_date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function PaymentEntryForm() {
  const router = useRouter();
  const [type, setType] = useState<"Pay" | "Receive">("Pay");
  const [partyType, setPartyType] = useState<"Supplier" | "Customer">(
    "Supplier",
  );
  const [party, setParty] = useState("");
  const [amount, setAmount] = useState(0);

  const handleSubmit = async () => {
    const res = await createPayment({
      payment_type: type,
      party_type: partyType,
      party,
      paid_amount: amount,
    });
    if (res.success) {
      toast.success("Payment Recorded");
      router.push("/handson/all/financials/accounts/payment-entry");
    } else toast.error(res.error);
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{tr("erp.record_payment")}</h1>
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div>
            <Label>{tr("erp.payment_type")}</Label>
            <RadioGroup
              value={type}
              onValueChange={(v: any) => setType(v)}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Pay" id="r1" />
                <Label htmlFor="r1">{tr("erp.pay_out")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Receive" id="r2" />
                <Label htmlFor="r2">{tr("erp.receive_in")}</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex gap-2">
            <div className="w-1/3">
              <Label>{tr("erp.party_type")}</Label>
              <Select
                value={partyType}
                onValueChange={(v: any) => setPartyType(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Supplier">{tr("erp.supplier")}</SelectItem>
                  <SelectItem value="Customer">{tr("erp.customer")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>{tr("erp.party_name")}</Label>
              <Input value={party} onChange={(e) => setParty(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>{tr("erp.amount")}</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <Button onClick={handleSubmit} className="w-full">
            Record {type}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
