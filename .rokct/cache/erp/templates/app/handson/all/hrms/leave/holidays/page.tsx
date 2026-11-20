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
import { RiCalendarLine } from "@remixicon/react";
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
import { format } from "date-fns";
import { getHolidays } from "@/app/actions/handson/all/hrms/leave";

import t from "@/app/lib/i18n";
export default function HolidayListPage() {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data = await getHolidays();
    setHolidays(data || []);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center">
          <RiCalendarLine className="mr-3 h-8 w-8" />
          {t("erp.holiday_list")}
        </h1>
        <p className="text-muted-foreground">
          {t("erp.company_holidays_for_the_current_year")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("erp.upcoming_holidays")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("erp.date")}</TableHead>
                <TableHead>{t("erp.day")}</TableHead>
                <TableHead>{t("erp.description")}</TableHead>
                <TableHead>{t("erp.type")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    {t("erp.loading")}
                  </TableCell>
                </TableRow>
              ) : holidays.length > 0 ? (
                holidays.map((h) => (
                  <TableRow key={h.name}>
                    <TableCell className="font-medium">
                      {format(new Date(h.holiday_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(h.holiday_date), "EEEE")}
                    </TableCell>
                    <TableCell>{h.description}</TableCell>
                    <TableCell>
                      {h.weekly_off ? (
                        <Badge variant="secondary">{t("erp.weekly_off")}</Badge>
                      ) : (
                        <Badge>{t("erp.holiday")}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center h-24 text-muted-foreground"
                  >
                    {t("erp.no_holidays_found")}
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
