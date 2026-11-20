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

import { getCurrencies } from "@/app/actions/base/admin/settings";
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
export default function CurrenciesPage() {
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCurrencies() {
      try {
        const data = await getCurrencies();
        setCurrencies(data);
      } catch (error) {
        console.error("Error fetching currencies:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCurrencies();
  }, []);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">{t("base.currencies")}</h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("base.name")}</TableHead>
              <TableHead>{t("base.symbol")}</TableHead>
              <TableHead>{t("base.code")}</TableHead>
              <TableHead>{t("base.exchange_rate")}</TableHead>
              <TableHead>{t("base.active")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <span className="text-sm text-muted-foreground">Loading…</span>
                </TableCell>
              </TableRow>
            ) : currencies.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t("base.no_currencies_found")}
                </TableCell>
              </TableRow>
            ) : (
              currencies.map((curr) => (
                <TableRow key={curr.name}>
                  <TableCell className="font-medium">
                    {curr.currency_name}
                  </TableCell>
                  <TableCell>{curr.symbol}</TableCell>
                  <TableCell>{curr.code}</TableCell>
                  <TableCell>{curr.exchange_rate}</TableCell>
                  <TableCell>
                    <Badge variant={curr.active ? "default" : "secondary"}>
                      {curr.active ? "Active" : "Inactive"}
                    </Badge>
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
