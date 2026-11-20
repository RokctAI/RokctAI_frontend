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

import { format } from "date-fns";
import { RiLoader4Line, RiGiftLine } from "@remixicon/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getBonuses } from "@/app/actions/promotions/marketing";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

import t from "@/app/lib/i18n";
export default function BonusesPage() {
  const [bonuses, setBonuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const data = await getBonuses();
      setBonuses(data);
    } catch (error) {
      console.error("Error fetching bonuses:", error);
      toast.error("Failed to load bonuses");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RiLoader4Line className="size-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t("loyalty.bonuses")}</h1>
        <p className="text-muted-foreground">
          {t("loyalty.view_bonuses_awarded_to_your_shop")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("loyalty.bonus_history")}</CardTitle>
          <CardDescription>{t("loyalty.list_of_all_bonuses_received")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("loyalty.date")}</TableHead>
                <TableHead>{t("loyalty.reason")}</TableHead>
                <TableHead className="text-right">{t("loyalty.amount")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bonuses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center h-24 text-muted-foreground"
                  >
                    {t("loyalty.no_bonuses_found")}
                  </TableCell>
                </TableRow>
              ) : (
                bonuses.map((bonus) => (
                  <TableRow key={bonus.name}>
                    <TableCell>
                      {format(new Date(bonus.bonus_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <RiGiftLine className="mr-2 size-4 text-purple-500" />
                        {bonus.reason}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(bonus.amount)}
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
