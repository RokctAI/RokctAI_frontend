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
import {
  RiAddLine,
  RiCalendarScheduleLine,
  RiShieldLine,
} from "@remixicon/react";
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
import { getShiftAssignments } from "@/app/actions/handson/all/hrms/shifts";

import t from "@/app/lib/i18n";
export default function ShiftPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await getShiftAssignments();
    setAssignments(data || []);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <RiCalendarScheduleLine className="mr-3 h-8 w-8" />
            {t("erp.shift_management")}
          </h1>
          <p className="text-muted-foreground">
            {t("erp.manage_employee_rosters_and_shift_schedules")}
          </p>
        </div>
        <Link href="/handson/all/hr/shift/new">
          <Button>
            <RiAddLine className="mr-2 h-4 w-4" />
            {t("erp.assign_shift")}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("erp.roster_overview")}</CardTitle>
          <CardDescription>{t("erp.upcoming_shift_assignments")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("erp.employee")}</TableHead>
                <TableHead>{t("erp.shift_type")}</TableHead>
                <TableHead>{t("erp.start_date")}</TableHead>
                <TableHead>{t("erp.end_date")}</TableHead>
                <TableHead>{t("erp.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    {t("erp.loading")}
                  </TableCell>
                </TableRow>
              ) : assignments.length > 0 ? (
                assignments.map((assign) => (
                  <TableRow key={assign.name}>
                    <TableCell className="font-medium">
                      {assign.employee_name}
                      <div className="text-xs text-muted-foreground">
                        {assign.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {assign.shift_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(assign.start_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {assign.end_date ? (
                        format(new Date(assign.end_date), "MMM d, yyyy")
                      ) : (
                        <span className="text-muted-foreground italic">
                          {t("erp.ongoing")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          assign.status === "Active" ? "default" : "secondary"
                        }
                      >
                        {assign.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center h-24 text-muted-foreground"
                  >
                    {t("erp.no_active_shift_assignments")}
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
