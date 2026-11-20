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
import { format } from "date-fns";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getSalarySlips } from "@/app/actions/handson/all/hrms/payroll";

import t from "@/app/lib/i18n";
export default function PayrollPage() {
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const data = await getSalarySlips();
      setPayslips(data || []);
    } catch (error) {
      toast.error("Failed to fetch payslips");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("erp.payroll")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("erp.payslips")}</CardTitle>
          <CardDescription>{t("erp.view_recent_salary_slips")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("erp.employee")}</TableHead>
                <TableHead>{t("erp.period")}</TableHead>
                <TableHead>{t("erp.status")}</TableHead>
                <TableHead className="text-right">{t("erp.net_pay")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payslips.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center h-24 text-muted-foreground"
                  >
                    {t("erp.no_payslips_found")}
                  </TableCell>
                </TableRow>
              ) : (
                payslips.map((slip) => (
                  <TableRow key={slip.name}>
                    <TableCell className="font-medium">
                      {slip.employee_name}
                    </TableCell>
                    <TableCell>
                      {format(new Date(slip.start_date), "MMM d")} -{" "}
                      {format(new Date(slip.end_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          slip.status === "Submitted" ? "default" : "secondary"
                        }
                      >
                        {slip.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {slip.net_pay?.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
