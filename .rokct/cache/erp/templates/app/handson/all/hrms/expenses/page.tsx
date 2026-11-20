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

import { useEffect, useState } from "react";
import { RiAddLine, RiReceiptLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { getExpenseClaims } from "@/app/actions/handson/all/hrms/expenses";

import t from "@/app/lib/i18n";
export default function ExpensesPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await getExpenseClaims();
    setClaims(data || []);
    setLoading(false);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "default";
      case "Approved":
        return "default"; // or green
      case "Submitted":
        return "secondary"; // Blueish
      case "Draft":
        return "outline";
      case "Rejected":
        return "destructive";
      case "Cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <RiReceiptLine className="mr-3 h-8 w-8" />
            {t("erp.expense_claims")}
          </h1>
          <p className="text-muted-foreground">
            {t("erp.manage_employee_expense_reimbursements")}
          </p>
        </div>
        <Link href="/handson/all/hr/expenses/new">
          <Button>
            <RiAddLine className="mr-2 h-4 w-4" />
            {t("erp.new_claim")}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("erp.claims_history")}</CardTitle>
          <CardDescription>{t("erp.recent_expense_claims_submitted")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("erp.employee")}</TableHead>
                <TableHead>{t("erp.date")}</TableHead>
                <TableHead className="text-right">{t("erp.total_amount")}</TableHead>
                <TableHead>{t("erp.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    {t("erp.loading")}
                  </TableCell>
                </TableRow>
              ) : claims.length > 0 ? (
                claims.map((claim) => (
                  <TableRow key={claim.name}>
                    <TableCell className="font-medium">
                      {claim.employee_name}
                      <div className="text-xs text-muted-foreground">
                        {claim.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(claim.posting_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {claim.grand_total?.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      }) || "$0.00"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          getStatusColor(
                            claim.status || claim.approval_status,
                          ) as any
                        }
                      >
                        {claim.status || claim.approval_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center h-24 text-muted-foreground"
                  >
                    {t("erp.no_expense_claims_found")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
