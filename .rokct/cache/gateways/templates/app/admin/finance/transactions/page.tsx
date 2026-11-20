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

import { getTransactions } from "@/app/actions/gateways/admin/transactions";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import t from "@/app/lib/i18n";
export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">{t("gateways.transactions")}</h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("gateways.id")}</TableHead>
              <TableHead>{t("gateways.date")}</TableHead>
              <TableHead>{t("gateways.user")}</TableHead>
              <TableHead>{t("gateways.type")}</TableHead>
              <TableHead className="text-right">{t("gateways.amount")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <RiLoader4Line className="size-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t("gateways.no_transactions_found")}
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.name}>
                  <TableCell className="font-medium">{tx.name}</TableCell>
                  <TableCell>{format(new Date(tx.creation), "PPP")}</TableCell>
                  <TableCell>{tx.user}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{tx.type}</Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${tx.amount < 0 ? "text-red-600" : "text-green-600"}`}
                  >
                    {tx.amount < 0 ? "-" : "+"}${Math.abs(tx.amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
