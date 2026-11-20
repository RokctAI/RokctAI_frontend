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
import { RiLoader4Line } from "@remixicon/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getPayouts } from "@/app/actions/gateways/finance";
import { Badge } from "@/components/ui/badge";
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
export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const data = await getPayouts();
      setPayouts(data);
    } catch (error) {
      console.error("Error fetching payouts:", error);
      toast.error("Failed to load payouts");
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
        <h1 className="text-3xl font-bold">{t("gateways.payouts")}</h1>
        <p className="text-muted-foreground">
          {t("gateways.view_your_payout_history_from_the_platform")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("gateways.payout_history")}</CardTitle>
          <CardDescription>
            {t("gateways.list_of_all_payouts_processed_to_your_account")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("gateways.date")}</TableHead>
                <TableHead>{t("gateways.payout_id")}</TableHead>
                <TableHead>{t("gateways.status")}</TableHead>
                <TableHead className="text-right">{t("gateways.amount")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center h-24 text-muted-foreground"
                  >
                    {t("gateways.no_payouts_found")}
                  </TableCell>
                </TableRow>
              ) : (
                payouts.map((p) => (
                  <TableRow key={p.name}>
                    <TableCell>
                      {format(new Date(p.payout_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={p.status === "Paid" ? "default" : "secondary"}
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(p.amount)}
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
