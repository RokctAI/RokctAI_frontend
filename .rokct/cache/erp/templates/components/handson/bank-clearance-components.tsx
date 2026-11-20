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
import { updateClearanceDate } from "@/app/actions/handson/all/accounting/payments/updateClearanceDate";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import t from "@/app/lib/i18n";
export function BankClearanceTool({ payments }: { payments: any[] }) {
  // We reuse the payments list but add a date picker action
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [date, setDate] = useState("");

  const handleUpdate = async () => {
    if (!selectedId || !date) return;
    const res = await updateClearanceDate("Payment Entry", selectedId, date);
    if (res.success) {
      toast.success("Clearance Date Updated");
      setSelectedId(null);
      setDate("");
      // In a real app we'd revalidate/refresh here
      window.location.reload();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("erp.bank_clearance")}</h1>
        <p className="text-muted-foreground">
          {t("erp.match_system_payments_with_bank_statement_dates")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("erp.payment")}</TableHead>
                <TableHead>{t("erp.party")}</TableHead>
                <TableHead>{t("erp.amount")}</TableHead>
                <TableHead>{t("erp.clearance_date")}</TableHead>
                <TableHead>{t("erp.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.name}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.party_name}</TableCell>
                  <TableCell>{p.paid_amount}</TableCell>
                  <TableCell>
                    {p.clearance_date || (
                      <span className="text-muted-foreground italic">
                        {t("erp.pending")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedId(p.name)}
                    >
                      {t("erp.update")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>{t("erp.update_clearance")}</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedId ? (
                <div className="space-y-4">
                  <div className="text-sm font-medium">
                    Selected: {selectedId}
                  </div>
                  <div>
                    <Label>{t("erp.bank_date")}</Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdate} className="flex-1">
                      {t("erp.save")}
                    </Button>
                    <Button variant="ghost" onClick={() => setSelectedId(null)}>
                      {t("erp.cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-8 text-center">
                  {t("erp.select_a_payment_to_update")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
