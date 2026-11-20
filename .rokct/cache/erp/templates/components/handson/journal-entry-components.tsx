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
import { createJournalEntry } from "@/app/actions/handson/all/accounting/journals/createJournalEntry";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import tr from "@/app/lib/i18n";
export function JournalEntryList({ items }: { items: any[] }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{tr("erp.journal_entries")}</h1>
          <p className="text-muted-foreground">{tr("erp.general_ledger_adjustments")}</p>
        </div>
        <Link href="/handson/all/financials/accounts/journal-entry/new">
          <Button>
            <RiAddLine className="mr-2 h-4 w-4" /> {tr("erp.new_entry")}
          </Button>
        </Link>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tr("erp.voucher_no")}</TableHead>
              <TableHead>{tr("erp.type")}</TableHead>
              <TableHead>{tr("erp.date")}</TableHead>
              <TableHead>{tr("erp.total_debit")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((t) => (
              <TableRow key={t.name}>
                <TableCell>{t.name}</TableCell>
                <TableCell>{t.voucher_type}</TableCell>
                <TableCell>{t.posting_date}</TableCell>
                <TableCell>{t.total_debit}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function JournalEntryForm() {
  const router = useRouter();
  const [account1, setAccount1] = useState("");
  const [debit, setDebit] = useState(0);
  const [account2, setAccount2] = useState("");
  const [credit, setCredit] = useState(0);

  const handleSubmit = async () => {
    if (debit !== credit) {
      toast.error("Debit and Credit must match!");
      return;
    }

    const res = await createJournalEntry({
      company: "Juvo",
      voucher_type: "Journal Entry",
      posting_date: new Date().toISOString().split("T")[0],
      accounts: [
        {
          account: account1,
          debit_in_account_currency: debit,
          credit_in_account_currency: 0,
        },
        {
          account: account2,
          debit_in_account_currency: 0,
          credit_in_account_currency: credit,
        },
      ],
    });
    if (res.success) {
      toast.success("Entry Posted");
      router.push("/handson/all/financials/accounts/journal-entry");
    } else toast.error(res.error);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{tr("erp.new_journal_entry")}</h1>
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="p-4 border rounded bg-muted/20">
            <Label className="font-bold mb-2 block">{tr("erp.debit_entry")}</Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>{tr("erp.account")}</Label>
                <Input
                  value={account1}
                  onChange={(e) => setAccount1(e.target.value)}
                  placeholder="e.g. Bank"
                />
              </div>
              <div className="w-32">
                <Label>{tr("erp.debit_amount")}</Label>
                <Input
                  type="number"
                  value={debit}
                  onChange={(e) => setDebit(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="p-4 border rounded bg-muted/20">
            <Label className="font-bold mb-2 block">{tr("erp.credit_entry")}</Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>{tr("erp.account")}</Label>
                <Input
                  value={account2}
                  onChange={(e) => setAccount2(e.target.value)}
                  placeholder="e.g. Cash"
                />
              </div>
              <div className="w-32">
                <Label>{tr("erp.credit_amount")}</Label>
                <Input
                  type="number"
                  value={credit}
                  onChange={(e) => setCredit(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            {tr("erp.post_entry")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
